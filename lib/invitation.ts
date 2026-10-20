export const defaults = {
 name: '조이랑', date: '2026-11-14', time: '12:20', venue: '롯데시티호텔 대전', address: '', room: '', parking: '',
 greeting: '작은 손으로 세상을 만난 이랑이가\n어느새 첫 번째 생일을 맞이합니다.\n\n사랑으로 지켜봐 주신 소중한 분들과\n이 특별한 하루를 함께하고 싶어요.\n오셔서 이랑이의 첫걸음을 축복해 주세요.',
 hosts: '이랑이 엄마 · 아빠 드림', heroId: '', notice: '함께해 주시는 마음만으로도 큰 선물입니다.'
};
export type Settings = typeof defaults;
export type Photo = { sort_order: number; id: string; caption: string; created_at: string };
export type Comment = { id: string; name: string; message: string; created_at: string };
