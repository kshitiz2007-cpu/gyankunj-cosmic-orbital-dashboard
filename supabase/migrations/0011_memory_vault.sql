-- Memory Vault: reusable UPSC recall cards and student-owned mastery state.
begin;

create table if not exists public.memory_cards (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  category_label_en text not null,
  category_label_hi text not null,
  prompt_en text not null,
  prompt_hi text not null,
  answer_en text not null,
  answer_hi text not null,
  rationale_en text,
  rationale_hi text,
  exam_tags text[] not null default array['UPSC CSE']::text[],
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_memory_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  card_id uuid not null references public.memory_cards(id) on delete cascade,
  is_mastered boolean not null default false,
  mastered_at timestamptz,
  review_count integer not null default 0,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id,card_id)
);

alter table public.memory_cards enable row level security;
alter table public.student_memory_progress enable row level security;

drop policy if exists "memory cards published read" on public.memory_cards;
create policy "memory cards published read" on public.memory_cards
  for select to authenticated using(is_published or public.is_admin());
drop policy if exists "memory cards admin manage" on public.memory_cards;
create policy "memory cards admin manage" on public.memory_cards
  for all to authenticated using(public.is_admin()) with check(public.is_admin());

drop policy if exists "memory progress own read" on public.student_memory_progress;
create policy "memory progress own read" on public.student_memory_progress
  for select to authenticated using(student_id=auth.uid() or public.is_admin());
drop policy if exists "memory progress own insert" on public.student_memory_progress;
create policy "memory progress own insert" on public.student_memory_progress
  for insert to authenticated with check(student_id=auth.uid());
drop policy if exists "memory progress own update" on public.student_memory_progress;
create policy "memory progress own update" on public.student_memory_progress
  for update to authenticated using(student_id=auth.uid()) with check(student_id=auth.uid());
drop policy if exists "memory progress own delete" on public.student_memory_progress;
create policy "memory progress own delete" on public.student_memory_progress
  for delete to authenticated using(student_id=auth.uid());

create index if not exists memory_cards_published_category_idx
  on public.memory_cards(is_published,category,sort_order);
create index if not exists student_memory_progress_student_idx
  on public.student_memory_progress(student_id,is_mastered,updated_at desc);

insert into public.memory_cards(
  id,category,category_label_en,category_label_hi,prompt_en,prompt_hi,
  answer_en,answer_hi,rationale_en,rationale_hi,exam_tags,sort_order,is_published
) values
('a1000000-0000-4000-8000-000000000001','important-articles','Important Constitutional Articles','महत्त्वपूर्ण संवैधानिक अनुच्छेद',
 'Which Article guarantees equality before the law and equal protection of the laws?',
 'विधि के समक्ष समता तथा विधियों के समान संरक्षण की गारंटी कौन-सा अनुच्छेद देता है?',
 'Article 14','अनुच्छेद 14',
 'It applies to every person, not only citizens. It permits reasonable classification but prohibits class legislation.',
 'यह प्रत्येक व्यक्ति को प्राप्त है, केवल नागरिकों को नहीं। यह युक्तियुक्त वर्गीकरण की अनुमति देता है, लेकिन वर्ग-विधान को निषिद्ध करता है।',
 array['UPSC Prelims','Polity'],1,true),
('a1000000-0000-4000-8000-000000000002','important-articles','Important Constitutional Articles','महत्त्वपूर्ण संवैधानिक अनुच्छेद',
 'Which Article protects the right to life and personal liberty?',
 'जीवन और व्यक्तिगत स्वतंत्रता के संरक्षण का प्रावधान किस अनुच्छेद में है?',
 'Article 21','अनुच्छेद 21',
 'The Supreme Court has interpreted it to include dignity, privacy, livelihood and a range of procedural protections.',
 'उच्चतम न्यायालय ने इसकी व्यापक व्याख्या करते हुए गरिमा, निजता, आजीविका तथा विभिन्न प्रक्रियात्मक संरक्षणों को इसके दायरे में शामिल किया है।',
 array['UPSC Prelims','Polity'],2,true),
('a1000000-0000-4000-8000-000000000003','important-articles','Important Constitutional Articles','महत्त्वपूर्ण संवैधानिक अनुच्छेद',
 'Which Article provides the constitutional remedy to move the Supreme Court for enforcement of Fundamental Rights?',
 'मौलिक अधिकारों के प्रवर्तन हेतु उच्चतम न्यायालय जाने का संवैधानिक उपचार किस अनुच्छेद में है?',
 'Article 32','अनुच्छेद 32',
 'Dr. B. R. Ambedkar described Article 32 as the heart and soul of the Constitution.',
 'डॉ. बी. आर. अम्बेडकर ने अनुच्छेद 32 को संविधान का हृदय और आत्मा कहा था।',
 array['UPSC Prelims','Polity'],3,true),
('a1000000-0000-4000-8000-000000000004','landmark-amendments','Landmark Amendments','महत्त्वपूर्ण संविधान संशोधन',
 'Which Constitutional Amendment Act is popularly called the “Mini Constitution”?',
 'किस संविधान संशोधन अधिनियम को सामान्यतः “लघु संविधान” कहा जाता है?',
 'The 42nd Constitutional Amendment Act, 1976','42वाँ संविधान संशोधन अधिनियम, 1976',
 'It made wide-ranging changes, including adding “Socialist”, “Secular” and “Integrity” to the Preamble and inserting Fundamental Duties.',
 'इसने व्यापक परिवर्तन किए; प्रस्तावना में “समाजवादी”, “पंथनिरपेक्ष” और “अखंडता” शब्द जोड़े तथा मूल कर्तव्यों को शामिल किया।',
 array['UPSC Prelims','Polity'],4,true),
('a1000000-0000-4000-8000-000000000005','landmark-amendments','Landmark Amendments','महत्त्वपूर्ण संविधान संशोधन',
 'Which Amendment curtailed several changes made by the 42nd Amendment and restored safeguards for civil liberties?',
 'किस संशोधन ने 42वें संशोधन के कई परिवर्तनों को सीमित किया और नागरिक स्वतंत्रताओं के संरक्षण को मजबूत किया?',
 'The 44th Constitutional Amendment Act, 1978','44वाँ संविधान संशोधन अधिनियम, 1978',
 'Among other changes, it replaced “internal disturbance” with “armed rebellion” as a ground for National Emergency and strengthened safeguards around Articles 20 and 21.',
 'अन्य परिवर्तनों के साथ इसने राष्ट्रीय आपातकाल के आधार के रूप में “आंतरिक अशांति” के स्थान पर “सशस्त्र विद्रोह” रखा तथा अनुच्छेद 20 और 21 के संरक्षण को मजबूत किया।',
 array['UPSC Prelims','Polity'],5,true),
('a1000000-0000-4000-8000-000000000006','landmark-judgments','Landmark Judgments','ऐतिहासिक न्यायिक निर्णय',
 'Which 1973 Supreme Court judgment propounded the Basic Structure Doctrine?',
 '1973 के किस उच्चतम न्यायालय के निर्णय ने मूल संरचना सिद्धांत प्रतिपादित किया?',
 'Kesavananda Bharati v. State of Kerala (1973)','केशवानंद भारती बनाम केरल राज्य (1973)',
 'The judgment held that Parliament may amend any part of the Constitution under Article 368, but cannot alter its basic structure.',
 'निर्णय के अनुसार संसद अनुच्छेद 368 के तहत संविधान के किसी भी भाग में संशोधन कर सकती है, लेकिन उसकी मूल संरचना को नष्ट नहीं कर सकती।',
 array['UPSC Prelims','UPSC Mains','Polity'],6,true)
on conflict(id) do update set
 category=excluded.category,category_label_en=excluded.category_label_en,
 category_label_hi=excluded.category_label_hi,prompt_en=excluded.prompt_en,
 prompt_hi=excluded.prompt_hi,answer_en=excluded.answer_en,answer_hi=excluded.answer_hi,
 rationale_en=excluded.rationale_en,rationale_hi=excluded.rationale_hi,
 exam_tags=excluded.exam_tags,sort_order=excluded.sort_order,is_published=true,
 updated_at=now();

commit;
