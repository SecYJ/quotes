import type { Source, Tag } from '@/lib/types'

// 跟数据库的表一样分开存，由 mock/api.ts 组合成 Quote

export type QuoteRow = {
  id: number
  content: string
  speaker: string | null
  sourceId: number
  sourceDetail: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export type QuoteTagRow = {
  quoteId: number
  tagId: number
}

export const seedSources: Source[] = [
  { id: 1, type: 'drama', title: '哈姆雷特', createdAt: '2026-09-01T10:00:00.000Z' },
  { id: 2, type: 'drama', title: '罗密欧与朱丽叶', createdAt: '2026-09-03T10:00:00.000Z' },
  { id: 3, type: 'drama', title: '麦克白', createdAt: '2026-09-05T10:00:00.000Z' },
  { id: 4, type: 'book', title: '论语', createdAt: '2026-09-08T10:00:00.000Z' },
  { id: 5, type: 'book', title: '道德经', createdAt: '2026-09-10T10:00:00.000Z' },
  { id: 6, type: 'book', title: '红楼梦', createdAt: '2026-09-12T10:00:00.000Z' },
  { id: 7, type: 'real_life', title: '朋友聊天', createdAt: '2026-09-15T10:00:00.000Z' },
  { id: 8, type: 'real_life', title: '公司会议', createdAt: '2026-09-18T10:00:00.000Z' },
  { id: 9, type: 'other', title: '播客', createdAt: '2026-09-20T10:00:00.000Z' },
]

export const seedTags: Tag[] = [
  { id: 1, name: '人生' },
  { id: 2, name: '时间' },
  { id: 3, name: '爱情' },
  { id: 4, name: '学习' },
  { id: 5, name: '工作' },
  { id: 6, name: '勇气' },
]

export const seedQuotes: QuoteRow[] = [
  {
    id: 1,
    content: '生存还是毁灭，这是一个值得考虑的问题。',
    speaker: '哈姆雷特',
    sourceId: 1,
    sourceDetail: '第三幕第一场',
    note: null,
    createdAt: '2026-09-01T12:00:00.000Z',
    updatedAt: '2026-09-01T12:00:00.000Z',
  },
  {
    id: 2,
    content: '名字有什么关系？我们叫做玫瑰的东西，换个名字还是一样芬芳。',
    speaker: '朱丽叶',
    sourceId: 2,
    sourceDetail: '第二幕第二场',
    note: '名字只是标签，本质才重要。',
    createdAt: '2026-09-03T12:00:00.000Z',
    updatedAt: '2026-09-03T12:00:00.000Z',
  },
  {
    id: 3,
    content:
      '明天，明天，再一个明天，一天接着一天地蹑步前进，直到最后一秒钟的时间；我们所有的昨天，不过替傻子们照亮了到死亡的土壤中去的路。熄灭了吧，熄灭了吧，短促的烛光！人生不过是一个行走的影子，一个在舞台上指手画脚的拙劣的伶人，登场片刻，就在无声无息中悄然退下。',
    speaker: '麦克白',
    sourceId: 3,
    sourceDetail: '第五幕第五场',
    note: '很长的一段，用来检查排版。',
    createdAt: '2026-09-05T12:00:00.000Z',
    updatedAt: '2026-09-05T12:00:00.000Z',
  },
  {
    id: 4,
    content: '学而不思则罔，思而不学则殆。',
    speaker: '孔子',
    sourceId: 4,
    sourceDetail: '为政篇',
    note: null,
    createdAt: '2026-09-08T12:00:00.000Z',
    updatedAt: '2026-09-08T12:00:00.000Z',
  },
  {
    id: 5,
    content: '三人行，必有我师焉。择其善者而从之，其不善者而改之。',
    speaker: '孔子',
    sourceId: 4,
    sourceDetail: '述而篇',
    note: null,
    createdAt: '2026-09-09T12:00:00.000Z',
    updatedAt: '2026-09-09T12:00:00.000Z',
  },
  {
    id: 6,
    content: '千里之行，始于足下。',
    speaker: '老子',
    sourceId: 5,
    sourceDetail: '第六十四章',
    note: null,
    createdAt: '2026-09-10T12:00:00.000Z',
    updatedAt: '2026-09-10T12:00:00.000Z',
  },
  {
    id: 7,
    content: '假作真时真亦假，无为有处有还无。',
    speaker: null,
    sourceId: 6,
    sourceDetail: '第一回，太虚幻境的对联',
    note: null,
    createdAt: '2026-09-12T12:00:00.000Z',
    updatedAt: '2026-09-12T12:00:00.000Z',
  },
  {
    id: 8,
    content: '不要等准备好了才开始，开始了才会准备好。',
    speaker: '小林',
    sourceId: 7,
    sourceDetail: '周末吃火锅的时候',
    note: '在犹豫要不要换工作时听到的。',
    createdAt: '2026-09-15T12:00:00.000Z',
    updatedAt: '2026-09-15T12:00:00.000Z',
  },
  {
    id: 9,
    content: '累的时候就休息，不要用"再撑一下"骗自己。',
    speaker: '阿珍',
    sourceId: 7,
    sourceDetail: null,
    note: null,
    createdAt: '2026-09-16T12:00:00.000Z',
    updatedAt: '2026-09-16T12:00:00.000Z',
  },
  {
    id: 10,
    content: '先把问题讲清楚，答案通常就出来了一半。',
    speaker: '主管',
    sourceId: 8,
    sourceDetail: '季度规划会议',
    note: null,
    createdAt: '2026-09-18T12:00:00.000Z',
    updatedAt: '2026-09-18T12:00:00.000Z',
  },
  {
    id: 11,
    content: '你不需要很厉害才能开始，但你需要开始才能很厉害。',
    speaker: null,
    sourceId: 9,
    sourceDetail: '某集访谈',
    note: null,
    createdAt: '2026-09-20T12:00:00.000Z',
    updatedAt: '2026-09-20T12:00:00.000Z',
  },
  {
    id: 12,
    content: '时间不会让事情变好，是你在那段时间里做的事让它变好。',
    speaker: '小林',
    sourceId: 7,
    sourceDetail: '下班一起走路回家',
    note: null,
    createdAt: '2026-09-22T12:00:00.000Z',
    updatedAt: '2026-09-22T12:00:00.000Z',
  },
]

export const seedQuoteTags: QuoteTagRow[] = [
  { quoteId: 1, tagId: 1 },
  { quoteId: 1, tagId: 6 },
  { quoteId: 2, tagId: 3 },
  { quoteId: 3, tagId: 1 },
  { quoteId: 3, tagId: 2 },
  { quoteId: 4, tagId: 4 },
  { quoteId: 5, tagId: 4 },
  { quoteId: 6, tagId: 6 },
  { quoteId: 6, tagId: 1 },
  { quoteId: 7, tagId: 1 },
  { quoteId: 8, tagId: 6 },
  { quoteId: 8, tagId: 5 },
  { quoteId: 9, tagId: 1 },
  { quoteId: 10, tagId: 5 },
  { quoteId: 11, tagId: 6 },
  { quoteId: 11, tagId: 4 },
  { quoteId: 12, tagId: 2 },
  { quoteId: 12, tagId: 1 },
]
