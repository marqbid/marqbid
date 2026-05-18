-- supabase/migrations/001_initial_schema.sql
-- Run this in your Supabase SQL editor or via Supabase CLI

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES ────────────────────────────────────────────────────────────────
create type user_role as enum ('homeowner', 'realtor', 'admin');

create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  full_name       text not null,
  role            user_role not null default 'homeowner',
  phone           text,
  license_number  text,    -- realtors only
  brokerage       text,    -- realtors only
  license_state   text,    -- realtors only (2-letter)
  bio             text,
  avg_rating      numeric(3,2) default 0,
  total_sales     int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'homeowner')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── LISTINGS ─────────────────────────────────────────────────────────────────
create type listing_status as enum ('draft', 'active', 'closed', 'sold', 'cancelled');

create table listings (
  id                   uuid primary key default uuid_generate_v4(),
  owner_id             uuid not null references profiles(id) on delete cascade,
  address              text not null,
  city                 text not null,
  state                char(2) not null,
  zip                  text not null,
  bedrooms             int,
  bathrooms            numeric(3,1),
  sqft                 int,
  year_built           int,
  description          text,
  asking_price         numeric(12,2),
  zestimate            numeric(12,2),
  reference_price      numeric(12,2) not null,  -- max(asking_price, zestimate)
  min_commission_pct   numeric(5,3) not null default 1.2,
  min_commission_usd   numeric(10,2) not null,
  status               listing_status not null default 'draft',
  bid_deadline         timestamptz not null,
  payment_confirmed    boolean not null default false,
  listing_fee_cents    int not null default 999,
  stripe_payment_id    text,
  photos               text[] default '{}',
  state_disclosure_shown boolean not null default false,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

alter table listings enable row level security;

create policy "Active listings visible to all"
  on listings for select using (
    status = 'active' or auth.uid() = owner_id
  );

create policy "Owners can insert own listings"
  on listings for insert with check (auth.uid() = owner_id);

create policy "Owners can update own listings"
  on listings for update using (auth.uid() = owner_id);

-- ── BIDS ─────────────────────────────────────────────────────────────────────
create type bid_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');
create type bid_type   as enum ('percentage', 'flat');

create table bids (
  id             uuid primary key default uuid_generate_v4(),
  listing_id     uuid not null references listings(id) on delete cascade,
  realtor_id     uuid not null references profiles(id) on delete cascade,
  bid_type       bid_type not null default 'percentage',
  commission_pct numeric(5,3),      -- if percentage bid
  commission_usd numeric(10,2) not null,  -- always stored
  cover_letter   text,
  status         bid_status not null default 'pending',
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique(listing_id, realtor_id)   -- one bid per realtor per listing
);

alter table bids enable row level security;

create policy "Listing owner can see all bids on their listing"
  on bids for select using (
    exists (
      select 1 from listings
      where listings.id = bids.listing_id
      and listings.owner_id = auth.uid()
    )
    or bids.realtor_id = auth.uid()
  );

create policy "Realtors can insert bids"
  on bids for insert with check (
    auth.uid() = realtor_id
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'realtor'
    )
  );

create policy "Realtors can update own bids"
  on bids for update using (auth.uid() = realtor_id);

-- ── REVIEWS ──────────────────────────────────────────────────────────────────
create table reviews (
  id          uuid primary key default uuid_generate_v4(),
  listing_id  uuid not null references listings(id),
  reviewer_id uuid not null references profiles(id),
  reviewed_id uuid not null references profiles(id),
  rating      int not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now()
);

alter table reviews enable row level security;

create policy "Reviews are public"
  on reviews for select using (true);

create policy "Only listing owners can leave reviews after sale"
  on reviews for insert with check (
    auth.uid() = reviewer_id
    and exists (
      select 1 from listings
      where listings.id = listing_id
      and listings.owner_id = auth.uid()
      and listings.status = 'sold'
    )
  );

-- ── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

-- Auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger listings_updated_at before update on listings
  for each row execute procedure update_updated_at_column();

create trigger bids_updated_at before update on bids
  for each row execute procedure update_updated_at_column();

-- Function to accept a bid (atomically updates listing + bid + rejects others)
create or replace function accept_bid(p_bid_id uuid, p_listing_id uuid, p_owner_id uuid)
returns void as $$
begin
  -- Verify ownership
  if not exists (
    select 1 from listings
    where id = p_listing_id and owner_id = p_owner_id
  ) then
    raise exception 'Unauthorized';
  end if;

  -- Accept the chosen bid
  update bids set status = 'accepted' where id = p_bid_id;

  -- Reject all other bids
  update bids set status = 'rejected'
  where listing_id = p_listing_id and id <> p_bid_id;

  -- Close the listing
  update listings set status = 'closed' where id = p_listing_id;
end;
$$ language plpgsql security definer;

-- Indexes
create index listings_state_idx on listings(state);
create index listings_status_idx on listings(status);
create index listings_owner_idx on listings(owner_id);
create index bids_listing_idx on bids(listing_id);
create index bids_realtor_idx on bids(realtor_id);
create index bids_commission_usd_idx on bids(listing_id, commission_usd);
