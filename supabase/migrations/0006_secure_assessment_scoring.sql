-- Secure assessment submission: scoring and answer keys stay on the database.
alter table public.assessment_attempts
  add column if not exists correct_count integer,
  add column if not exists answered_count integer,
  add column if not exists question_count integer;

-- Prevent clients from forging scores or editing a submitted attempt.
drop policy if exists "attempts student insert" on public.assessment_attempts;
drop policy if exists "attempts student update" on public.assessment_attempts;
revoke insert, update on public.assessment_attempts from anon, authenticated;

-- Students may read question content/options, but never the answer key column.
revoke select on public.questions from anon, authenticated;
grant select (id,assessment_id,subject_id,topic,question_en,question_hi,options_en,options_hi,explanation_en,explanation_hi,difficulty,created_at)
  on public.questions to authenticated;
grant insert (assessment_id,subject_id,topic,question_en,question_hi,options_en,options_hi,correct_option,explanation_en,explanation_hi,difficulty)
  on public.questions to authenticated;
grant update (assessment_id,subject_id,topic,question_en,question_hi,options_en,options_hi,correct_option,explanation_en,explanation_hi,difficulty)
  on public.questions to authenticated;

create or replace function public.submit_assessment_attempt(
  p_assessment_id uuid,
  p_answers jsonb
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_student uuid := auth.uid();
  v_assessment public.assessments%rowtype;
  v_question_count integer := 0;
  v_answered_count integer := 0;
  v_correct_count integer := 0;
  v_wrong_count integer := 0;
  v_score numeric(8,2) := 0;
  v_attempt_id uuid;
  v_review jsonb;
  v_key text;
  v_value text;
begin
  if v_student is null then raise exception 'Authentication required'; end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    raise exception 'Answers must be a JSON object';
  end if;

  select * into v_assessment
  from public.assessments
  where id=p_assessment_id and is_published=true
    and (available_from is null or available_from <= now())
    and (available_until is null or available_until >= now());
  if not found then raise exception 'Assessment is unavailable'; end if;

  select count(*) into v_question_count
  from public.questions where assessment_id=p_assessment_id;
  if v_question_count=0 then raise exception 'Assessment has no questions'; end if;

  for v_key,v_value in select key,value from jsonb_each_text(p_answers) loop
    if v_key !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'Invalid question identifier';
    end if;
    if not exists(select 1 from public.questions where id=v_key::uuid and assessment_id=p_assessment_id) then
      raise exception 'Answer references a question outside this assessment';
    end if;
    if v_value !~ '^[0-3]$' then raise exception 'Invalid answer option'; end if;
  end loop;

  select count(*) into v_answered_count from jsonb_each(p_answers);
  select count(*) into v_correct_count
  from jsonb_each_text(p_answers) a
  join public.questions q on q.id=a.key::uuid and q.assessment_id=p_assessment_id
  where q.correct_option=a.value::smallint;
  v_wrong_count := v_answered_count-v_correct_count;
  v_score := greatest(0, v_correct_count-(v_wrong_count*coalesce(v_assessment.negative_mark,0)));

  insert into public.assessment_attempts(
    assessment_id,student_id,answers,score,started_at,submitted_at,
    correct_count,answered_count,question_count
  ) values (
    p_assessment_id,v_student,p_answers,v_score,now(),now(),
    v_correct_count,v_answered_count,v_question_count
  ) returning id into v_attempt_id;

  insert into public.student_activity(student_id,activity_type,reference_id,metadata)
  values(v_student,
    case when v_assessment.kind='daily_drill' then 'daily_drill_submitted' when v_assessment.kind='mock' then 'mock_test_submitted' else 'assessment_submitted' end,
    p_assessment_id,
    jsonb_build_object('attempt_id',v_attempt_id,'score',v_score,'correct_count',v_correct_count,'answered_count',v_answered_count,'question_count',v_question_count,'accuracy',case when v_answered_count>0 then round(v_correct_count::numeric/v_answered_count*100) else 0 end)
  );

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',q.id,'correct_option',q.correct_option,
    'explanation',coalesce(q.explanation_hi,q.explanation_en,'')
  ) order by q.created_at asc),'[]'::jsonb)
  into v_review from public.questions q where q.assessment_id=p_assessment_id;

  return jsonb_build_object(
    'attempt_id',v_attempt_id,'score',v_score,'correct_count',v_correct_count,
    'wrong_count',v_wrong_count,'answered_count',v_answered_count,
    'question_count',v_question_count,'accuracy',
    case when v_answered_count>0 then round(v_correct_count::numeric/v_answered_count*100) else 0 end,
    'review',v_review
  );
end;
$$;

revoke all on function public.submit_assessment_attempt(uuid,jsonb) from public;
grant execute on function public.submit_assessment_attempt(uuid,jsonb) to authenticated;
