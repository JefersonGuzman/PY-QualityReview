-- Sellervate Quality Review — data model (docs/spec.md, slice 2).
-- Data rules live in the database so no screen can store an inconsistent review.

create type user_role as enum ('team_lead', 'specialist');

create table users (
  id   text primary key check (id ~ '^[a-z0-9-]+$'),
  name text not null check (length(btrim(name)) > 0),
  role user_role not null
);

-- A brand is the tenant: every response belongs to exactly one brand.
-- `guidelines` is what "good" means for that brand, shown next to every reply under review.
create table brands (
  id         text primary key check (id ~ '^[a-z0-9-]+$'),
  name       text not null unique check (length(btrim(name)) > 0),
  guidelines text not null default ''
);

-- Membership: many-to-many, no duplicates. Removing a user removes their memberships,
-- unless responses or reviews depend on them (composite FKs below, ON DELETE RESTRICT).
create table user_brands (
  user_id  text not null references users (id) on delete cascade,
  brand_id text not null references brands (id) on delete restrict,
  primary key (user_id, brand_id)
);

create table responses (
  id               text primary key default gen_random_uuid()::text,
  brand_id         text not null,
  specialist_id    text not null,
  subject          text not null check (length(btrim(subject)) between 1 and 200),
  customer_message text not null check (length(btrim(customer_message)) > 0),
  response_text    text not null check (length(btrim(response_text)) > 0),
  sent_at          timestamptz not null,
  -- Where the reply came from. Today everything is seeded; a helpdesk import later adds rows
  -- with source = 'helpdesk' and the helpdesk's own id, deduplicated per brand.
  source           text not null default 'manual' check (source in ('manual', 'seed', 'helpdesk')),
  external_id      text,
  unique (brand_id, source, external_id),
  unique (id, brand_id),
  -- The author must belong to the response's brand.
  foreign key (specialist_id, brand_id) references user_brands (user_id, brand_id) on delete restrict on update restrict
);

-- Global catalogue of what can be wrong with a reply. `critical` marks issues that lose
-- accounts (wrong information), as opposed to issues that are only annoying (tone).
create table issue_types (
  code       text primary key check (code ~ '^[a-z0-9-]+$'),
  label      text not null unique,
  critical   boolean not null default false,
  sort_order smallint not null
);

create table reviews (
  id          text primary key default gen_random_uuid()::text,
  response_id text not null unique,          -- at most one review per response
  brand_id    text not null,
  reviewer_id text not null,
  score       smallint not null check (score between 1 and 5),
  feedback    text not null check (length(btrim(feedback)) between 1 and 2000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (updated_at >= created_at),
  foreign key (response_id, brand_id) references responses (id, brand_id) on delete restrict on update restrict,
  -- The reviewer must belong to the reviewed response's brand.
  foreign key (reviewer_id, brand_id) references user_brands (user_id, brand_id) on delete restrict on update restrict
);

create table review_issues (
  review_id  text not null references reviews (id) on delete cascade,
  issue_code text not null references issue_types (code) on delete restrict,
  primary key (review_id, issue_code)
);

create index responses_brand_idx on responses (brand_id);
create index responses_specialist_idx on responses (specialist_id);
create index reviews_reviewer_idx on reviews (reviewer_id);

-- Role rules: responses are written by Specialists, reviews by Team Leads,
-- and a review is always later than the response it reviews.
create function check_response_author() returns trigger language plpgsql as $$
begin
  if (select role from users where id = new.specialist_id) <> 'specialist' then
    raise exception 'The author of a response must be a Specialist' using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger responses_author_is_specialist
  before insert or update on responses
  for each row execute function check_response_author();

create function check_review_rules() returns trigger language plpgsql as $$
begin
  if (select role from users where id = new.reviewer_id) <> 'team_lead' then
    raise exception 'The reviewer must be a Team Lead' using errcode = 'check_violation';
  end if;
  if new.created_at < (select sent_at from responses where id = new.response_id) then
    raise exception 'A review cannot be older than its response' using errcode = 'check_violation';
  end if;
  if tg_op = 'UPDATE' then
    new.created_at := old.created_at;  -- creation date is immutable
  end if;
  return new;
end $$;

create trigger reviews_rules
  before insert or update on reviews
  for each row execute function check_review_rules();

-- Reviews are never deleted (the coaching history must be kept).
create function forbid_review_delete() returns trigger language plpgsql as $$
begin
  raise exception 'Reviews cannot be deleted' using errcode = 'restrict_violation';
end $$;

create trigger reviews_no_delete
  before delete on reviews
  for each row execute function forbid_review_delete();

-- A user's role cannot change while responses or reviews depend on it.
create function check_role_change() returns trigger language plpgsql as $$
begin
  if new.role <> old.role and (
       exists (select 1 from responses where specialist_id = old.id)
    or exists (select 1 from reviews where reviewer_id = old.id)) then
    raise exception 'The role of a user with responses or reviews cannot change' using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger users_role_change
  before update of role on users
  for each row execute function check_role_change();
