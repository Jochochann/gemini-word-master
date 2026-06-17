export interface VocabItem {
  chinese: string;
  pinyin: string;
  japanese: string;
  component?: string; // 構成漢字メモ
}

export interface DialogueLine {
  speaker: 'A' | 'B' | 'NARRATION';
  chinese: string;
  pinyin: string;
  japanese: string;
}

export interface DialoguePart {
  part: string;
  lines: DialogueLine[];
}

export interface GrammarExample {
  chinese: string;
  pinyin: string;
  japanese: string;
}

export interface GrammarPoint {
  title: string;
  titleJa: string;
  description: string;
  examples: GrammarExample[];
}

export interface Lesson {
  id: number;
  vol: number;
  title: string;
  summary: string;
  vocabulary: VocabItem[];
  dialogues: DialoguePart[];
  grammar: GrammarPoint[];
}

export interface VolumeMeta {
  vol: number;
  lessonCount: number;
}

import { vol2Lessons } from './lessons_vol2'
import { vol3Lessons } from './lessons_vol3'

export const volumeMeta: VolumeMeta[] = [
  { vol: 1, lessonCount: 14 },
  { vol: 2, lessonCount: 13 },
  { vol: 3, lessonCount: 14 },
  { vol: 4, lessonCount: 14 },
  { vol: 5, lessonCount: 14 },
]

const vol2Lesson1: Lesson[] = [
  {
    id: 1,
    vol: 2,
    title: 'Lesson 1',
    summary: '週末の体調不良と休暇の計画',
    summary_detail:
      '週末Bは風邪をひいてどこにも行けませんでした。回復した今、もうすぐ20日以上の新年休暇が来ます。Bは田舎の友人宅に滞在するかも、Aは友人と山へスキーに行くかもしれないと話します。',
    vocabulary: [
      { chinese: '生病', pinyin: 'shēngbìng', japanese: '病気になる' },
      { chinese: '病', pinyin: 'bìng', japanese: '病気', component: '生病の構成漢字' },
      { chinese: '週末', pinyin: 'zhōumò', japanese: '週末' },
      { chinese: '怎麼了', pinyin: 'zěnmele', japanese: 'どうしたの？' },
      { chinese: '舒服', pinyin: 'shūfú', japanese: '気分がよい、快適だ' },
      { chinese: '禮拜', pinyin: 'lǐbài', japanese: '週' },
      { chinese: '醫生', pinyin: 'yīshēng', japanese: '医者' },
      { chinese: '感冒', pinyin: 'gǎnmào', japanese: '風邪をひく、風邪' },
      { chinese: '沒關係', pinyin: 'méiguānxi', japanese: '大丈夫、気にしないで' },
      { chinese: '不必', pinyin: 'búbì', japanese: '〜する必要はない' },
      { chinese: '藥', pinyin: 'yào', japanese: '薬' },
      { chinese: '就', pinyin: 'jiù', japanese: 'すぐに、〜すれば' },
      { chinese: '沒事兒', pinyin: 'méishìr', japanese: '大丈夫、何でもない' },
      { chinese: '好了', pinyin: 'hǎole', japanese: '治った、よくなった' },
      { chinese: '放假', pinyin: 'fàngjià', japanese: '休みになる' },
      { chinese: '打算', pinyin: 'dǎsuàn', japanese: 'つもりだ、計画する' },
      { chinese: '鄉下', pinyin: 'xiāngxià', japanese: '田舎' },
      { chinese: '也許', pinyin: 'yěxǔ', japanese: 'もしかすると、〜かもしれない' },
      { chinese: '可能', pinyin: 'kěnéng', japanese: '可能である、〜かもしれない' },
      { chinese: '山', pinyin: 'shān', japanese: '山' },
      { chinese: '滑雪', pinyin: 'huáxuě', japanese: 'スキーをする' },
      { chinese: '雪', pinyin: 'xuě', japanese: '雪', component: '滑雪の構成漢字' },
      { chinese: '得', pinyin: 'děi', japanese: '〜しなければならない' },
      { chinese: '特別', pinyin: 'tèbié', japanese: '特に' },
      { chinese: '小心', pinyin: 'xiǎoxīn', japanese: '気をつける' },
      { chinese: '心', pinyin: 'xīn', japanese: '心', component: '小心の構成漢字' },
      { chinese: '放心', pinyin: 'fàngxīn', japanese: '安心する' },
      { chinese: '頭', pinyin: 'tóu', japanese: '頭' },
      { chinese: '痛', pinyin: 'tòng', japanese: '痛い' },
      { chinese: '壞了', pinyin: 'huàile', japanese: '壊れた' },
      { chinese: '壞', pinyin: 'huài', japanese: '悪い', component: '壞了の構成漢字' },
      { chinese: '忘', pinyin: 'wàng', japanese: '忘れる' },
    ],
    dialogues: [
      {
        part: 'Part I',
        lines: [
          {
            speaker: 'A',
            chinese: '這個週末，你到哪裡去了？',
            pinyin: 'Zhèige zhōumò, nǐ dào nǎlǐ qùle?',
            japanese: '今週末、どこに行きましたか？',
          },
          {
            speaker: 'B',
            chinese: '我沒到哪裡去。我生病了。',
            pinyin: 'Wǒ méidào nǎlǐ qù. Wǒ shēngbìngle.',
            japanese: 'どこにも行きませんでした。病気でした。',
          },
          {
            speaker: 'A',
            chinese: '你怎麼了？哪裡不舒服？',
            pinyin: 'Nǐ zěnmele? Nǎlǐ bù shūfú?',
            japanese: 'どうしたのですか？どこか具合が悪かったのですか？',
          },
          {
            speaker: 'B',
            chinese: '上個禮拜我常常覺得很累，也不太想吃東西。',
            pinyin: 'Shàngge lǐbài wǒ chángcháng juéde hěn lèi, yě bútài xiǎng chī dōngxī.',
            japanese: '先週は頻繁にとても疲れを感じて、あまり食べたくありませんでした。',
          },
          {
            speaker: 'A',
            chinese: '看醫生了嗎？',
            pinyin: 'Kàn yīshēng le ma?',
            japanese: '医者には診てもらいましたか？',
          },
          {
            speaker: 'B',
            chinese: '看了。',
            pinyin: 'Kànle.',
            japanese: 'はい、診てもらいました。',
          },
          {
            speaker: 'A',
            chinese: '醫生怎麼說？',
            pinyin: 'Yīshēng zěnme shuō?',
            japanese: '医者は何と言っていましたか？',
          },
          {
            speaker: 'B',
            chinese: '他說我感冒了，沒什麼關係，不必吃藥，休息幾天就沒事兒了。',
            pinyin: 'Tā shuō wǒ gǎnmào le, méi shénme guānxi, búbì chī yào, xiūxí jǐtiān jiù méishìr le.',
            japanese: '風邪だと言われました。大したことはありません。薬を飲む必要はなく、数日休めば良くなるとのことでした。',
          },
          {
            speaker: 'A',
            chinese: '現在覺得怎麼樣？',
            pinyin: 'Xiànzài juéde zěnmeyàng?',
            japanese: '今はどう感じますか？',
          },
          {
            speaker: 'B',
            chinese: '差不多好了，謝謝。',
            pinyin: 'Chàbùduō hǎole, xièxie.',
            japanese: 'ほぼ元通りです、ありがとう。',
          },
        ],
      },
      {
        part: 'Part II',
        lines: [
          {
            speaker: 'A',
            chinese: '你感冒好了沒有？',
            pinyin: 'Nǐ gǎnmào hǎole méiyǒu?',
            japanese: '風邪は良くなりましたか？',
          },
          {
            speaker: 'B',
            chinese: '早就好了。',
            pinyin: 'Zǎo jiù hǎole.',
            japanese: 'とっくに良くなりました。',
          },
          {
            speaker: 'A',
            chinese: '新年快到了，我們放二十幾天的假，你打算做什麼？',
            pinyin: 'Xīnnián kuài dào le, wǒmen fàng èrshíjǐtiānde jià, nǐ dǎsuàn zuò shénme?',
            japanese: 'もうすぐお正月ですね。私たちは20日以上休みになりますが、何をする予定ですか？',
          },
          {
            speaker: 'B',
            chinese: '還不一定。我有一個朋友，他家在鄉下，我也許到他那裡住幾天，你呢？',
            pinyin: 'Hái bùyídìng. Wǒ yǒu yíge péngyǒu, tā jiā zài xiāngxià, wǒ yěxǔ dào tā nàlǐ zhù jǐtiān, nǐ ne?',
            japanese: 'まだ分かりません。田舎に住んでいる友人がいるので、そこに数日泊まりに行くかもしれません。あなたは？',
          },
          {
            speaker: 'A',
            chinese: '我可能跟朋友到山上去滑雪。',
            pinyin: 'Wǒ kěnéng gēn péngyǒu dào shānshàng qù huáxuě.',
            japanese: '私は友人と一緒に山へスキーに行くかもしれません。',
          },
          {
            speaker: 'B',
            chinese: '你們怎麼去呢？',
            pinyin: 'Nǐmen zěnme qù ne?',
            japanese: 'どうやって行くのですか？',
          },
          {
            speaker: 'A',
            chinese: '我們開車去。',
            pinyin: 'Wǒmen kāichē qù.',
            japanese: '車で行きます。',
          },
          {
            speaker: 'B',
            chinese: '天氣太冷，開車得特別小心啊！',
            pinyin: 'Tiānqì tài lěng, kāichē děi tèbié xiǎoxīn a!',
            japanese: '天気がとても寒いので、運転には特に気をつけてくださいね！',
          },
          {
            speaker: 'A',
            chinese: '放心，我開車開了快三年了，我開得很好。',
            pinyin: 'Fàngxīn, wǒ kāichē kāile kuài sānnián le. Wǒ kāide hěn hǎo.',
            japanese: '心配しないで。私はもう3年近く運転していますから。運転はとても上手です。',
          },
        ],
      },
      {
        part: 'ナレーション',
        lines: [
          {
            speaker: 'NARRATION',
            chinese:
              '上個星期放假，我到山上去滑雪。山上的天氣很冷，我覺得不太舒服，頭有一點痛，我想也許生病了。回了家，就馬上去看醫生。醫生說我感冒了，沒什麼關係，休息休息就好了。他還說因為最近天氣冷，感冒的人特別多。我聽了他的話，就放心了，打算到鄉下去住幾天。',
            pinyin:
              'Shàngge xīngqí fàngjià, wǒ dào shānshàng qù huáxuě. Shānshàngde tiānqì hěn lěng, wǒ juéde bútài shūfú, tóu yǒu yìdiǎn tòng, wǒ xiǎng yěxǔ shēngbìngle. Huíle jiā, jiù mǎshàng qù kàn yīshēng. Yīshēng shuō wǒ gǎnmàole, méi shénme guānxi, xiūxí xiūxí jiù hǎole. Tā hái shuō yīnwèi zuìjìn tiānqì lěng, gǎnmàode rén tèbié duō. Wǒ tīngle tāde huà, jiù fàngxīnle, dǎsuàn dào xiāngxià qù zhù jǐtiān.',
            japanese:
              '先週は休みでした。私は山へスキーに行きました。山の天気はとても寒かったです。私は少し気分が悪く、頭が少し痛かったです。もしかしたら病気になりかけているのかもしれないと思いました。家に帰ってすぐに医者に診てもらいました。医者は私が風邪を引いているが、大したことはないと言いました。休息さえとれば良くなると。彼はまた、最近天気が寒かったので、非常に多くの人が風邪を引いていると言いました。彼の話を聞いて安心し、数日間田舎に行く計画を立てました。',
          },
        ],
      },
    ],
    grammar: [
      {
        title: '疑問詞の不定用法',
        titleJa: 'Question Words as Indefinites',
        description:
          '疑問詞（什麼、哪裡、誰など）を使って「何か」「どこか」「誰か」という不定の意味を表します。否定形では「何も〜ない」「どこも〜ない」の意味になります。',
        examples: [
          {
            chinese: '關於這個專案，你有什麼問題嗎？',
            pinyin: 'Guānyù zhège zhuān\'àn, nǐ yǒu shénme wèntí ma?',
            japanese: 'このプロジェクトについて、何か質問はありますか？',
          },
          {
            chinese: '我沒什麼問題。',
            pinyin: 'Wǒ méi shénme wèntí.',
            japanese: '特に質問はありません。',
          },
        ],
      },
      {
        title: '助詞「了」による状態の変化',
        titleJa: 'Change of Status with the Particle 了',
        description:
          '状態動詞や動詞の後に「了」をつけることで、新しい状況や状態の変化が発生したことを示します。',
        examples: [
          {
            chinese: '會議資料已經準備好了。',
            pinyin: 'Huìyì zīliào yǐjīng zhǔnbèi hǎo le.',
            japanese: '会議の資料はもう準備ができました。',
          },
          {
            chinese: '他不在這個部門工作了。',
            pinyin: 'Tā búzài zhège bùmén gōngzuò le.',
            japanese: '彼はもうこの部署では働いていません。',
          },
        ],
      },
      {
        title: '助詞「了」による切迫した動作',
        titleJa: 'Imminent Action with the Particle 了',
        description:
          '「快」「快要」「要」「就(要)」などを動詞の前に置き、文末に「了」をつけることで、「まもなく〜する」という意味を表します。',
        examples: [
          {
            chinese: '客戶快要到了，請準備一下。',
            pinyin: 'Kèhù kuàiyào dào le, qǐng zhǔnbèi yíxià.',
            japanese: 'お客様がもうすぐ到着しますので、準備をお願いします。',
          },
          {
            chinese: '會議馬上就要開始了。',
            pinyin: 'Huìyì mǎshàng jiùyào kāishǐ le.',
            japanese: '会議がまもなく始まります。',
          },
        ],
      },
    ],
  } as unknown as Lesson,
]

export const lessons: Lesson[] = [...vol2Lesson1, ...vol2Lessons, ...vol3Lessons]
