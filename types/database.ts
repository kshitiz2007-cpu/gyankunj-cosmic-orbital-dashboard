export type AppRole = "student" | "faculty" | "admin";
export type Profile = { id:string; full_name:string|null; email:string|null; role:AppRole; exam_target:string|null; preferred_language:string; created_at:string };
export type Subject = { id:string; slug:string; name_en:string; name_hi:string|null; sort_order:number };
export type StudyResource = { id:string; subject_id:string|null; title_en:string; title_hi:string|null; resource_type:"text"|"pdf"|"image"; content_text:string|null; storage_path:string|null; topic:string|null; is_published:boolean; created_at:string };
export type QuizQuestion = { id:string; subject_id:string|null; topic:string|null; question_en:string; question_hi:string; options_en:string[]; options_hi:string[]; correct_option: number; explanation_en:string|null; explanation_hi:string|null; difficulty:string; created_at:string };
