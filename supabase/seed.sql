insert into public.organizations (id, name, slug)
values ('11111111-1111-1111-1111-111111111111', 'Froggy Labs', 'froggy-labs')
on conflict (id) do nothing;

insert into public.evaluation_axes (
  id,
  organization_id,
  name,
  description,
  positive_signals,
  negative_signals,
  anchored_bands
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '11111111-1111-1111-1111-111111111111',
    'Coding',
    'Writes clear, correct code and debugs methodically under time pressure.',
    array['Finds a correct core approach quickly', 'Explains tradeoffs while coding'],
    array['Gets stuck on syntax details', 'Leaves obvious bugs unresolved'],
    array[
      'Needs heavy prompting and cannot reach a working shape.',
      'Reaches parts of the solution but leaves major gaps.',
      'Produces a workable baseline with some coaching.',
      'Solves the core problem cleanly and checks edge cases.',
      'Solves efficiently, communicates tradeoffs, and improves the design under pressure.'
    ]
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '11111111-1111-1111-1111-111111111111',
    'System design',
    'Designs durable architectures with clear boundaries, tradeoffs, and scale awareness.',
    array['Clarifies requirements early', 'Uses appropriate APIs and data flows'],
    array['Skips requirements', 'Misses operational or scale constraints'],
    array[
      'Jumps into a design without structure or requirements.',
      'Names pieces of a design but leaves major gaps in data flow or scale.',
      'Builds a functional design that covers the happy path.',
      'Balances architecture, user experience, and tradeoffs well.',
      'Designs with clarity, prioritization, resilience, and strong tradeoff reasoning.'
    ]
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    '11111111-1111-1111-1111-111111111111',
    'Communication',
    'Explains reasoning clearly, adapts to follow-ups, and keeps interviewers aligned.',
    array['Uses structure', 'Responds well to ambiguity'],
    array['Answers wander', 'Struggles to align on tradeoffs'],
    array[
      'Difficult to follow and misses core questions.',
      'Some signal is present, but the answer stays disorganized.',
      'Communicates clearly enough to collaborate on the problem.',
      'Explains tradeoffs and incorporates feedback smoothly.',
      'Leads a crisp, high-signal conversation that improves the final answer.'
    ]
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
    '11111111-1111-1111-1111-111111111111',
    'Ownership',
    'Takes responsibility for ambiguous work, follow-through, and operational outcomes.',
    array['Names monitoring and follow-up steps', 'Pushes on root causes'],
    array['Stops at the first fix', 'Avoids tradeoffs and accountability'],
    array[
      'Avoids ownership and focuses only on the narrow prompt.',
      'Can name actions but not the follow-through plan.',
      'Shows reasonable responsibility for delivery and quality.',
      'Connects technical decisions to operational outcomes and follow-up.',
      'Shows strong initiative, risk management, and end-to-end accountability.'
    ]
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
    '11111111-1111-1111-1111-111111111111',
    'Product judgment',
    'Balances candidate experience, user needs, and product tradeoffs in technical decisions.',
    array['Prioritizes user impact', 'Makes tradeoffs explicit'],
    array['Optimizes only for engineering convenience', 'Misses user risk'],
    array[
      'Misses the user problem and cannot prioritize tradeoffs.',
      'Shows some intuition but does not connect choices to users.',
      'Balances user and engineering concerns on the main path.',
      'Makes thoughtful tradeoffs grounded in product impact.',
      'Frames the problem exceptionally well and drives toward the highest-value decision.'
    ]
  )
on conflict (id) do nothing;

insert into public.reference_companies (id, organization_id, name, slug, website, logo_url)
values
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    '11111111-1111-1111-1111-111111111111',
    'Stripe',
    'stripe',
    'https://stripe.com',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Stripe_logo%2C_revised_2016.svg/512px-Stripe_logo%2C_revised_2016.svg.png'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    '11111111-1111-1111-1111-111111111111',
    'Airbnb',
    'airbnb',
    'https://airbnb.com',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/512px-Airbnb_Logo_B%C3%A9lo.svg.png'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
    '11111111-1111-1111-1111-111111111111',
    'Notion',
    'notion',
    'https://notion.so',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Notion_app_logo.png/512px-Notion_app_logo.png'
  )
on conflict (id) do nothing;

insert into public.roles (id, organization_id, name, level)
values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Senior Frontend Engineer', 'senior'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Staff Backend Engineer', 'staff')
on conflict (id) do nothing;

insert into public.interview_flows (id, organization_id, role_id, name, version, status)
values
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'Senior Frontend Loop', 1, 'active'),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Staff Backend Loop', 1, 'draft')
on conflict (id) do nothing;

insert into public.interview_stages (
  id,
  flow_id,
  name,
  description,
  order_index,
  canvas_x,
  canvas_y,
  duration_minutes,
  interviewer_role,
  axis_ids,
  scoring_rules
)
values
  (
    '44444444-4444-4444-4444-444444444441',
    '33333333-3333-3333-3333-333333333331',
    'Frontend coding',
    'Debug and extend a real UI scenario with evidence-based scoring.',
    1,
    40,
    70,
    60,
    'Senior frontend engineer',
    array['axis_coding', 'axis_ownership', 'axis_communication'],
    array['Every axis score must include evidence.', 'Candidate should leave with at least one code path or experiment plan.']
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    '33333333-3333-3333-3333-333333333331',
    'Frontend system design',
    'Evaluate architecture, tradeoffs, and collaboration on a product-facing scenario.',
    2,
    360,
    70,
    60,
    'Tech lead',
    array['axis_system_design', 'axis_product_judgment', 'axis_communication'],
    array['Spend the first five minutes clarifying requirements.', 'Score product judgment separately from architecture quality.']
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    '33333333-3333-3333-3333-333333333331',
    'Hiring manager',
    'Probe ownership, communication, and product tradeoffs in ambiguous work.',
    3,
    680,
    70,
    45,
    'Hiring manager',
    array['axis_ownership', 'axis_communication', 'axis_product_judgment'],
    array['Use follow-ups to test prioritization under conflict.', 'Block submission if recommendation and evidence do not match.']
  )
on conflict (id) do nothing;
