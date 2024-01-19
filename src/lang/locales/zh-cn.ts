export default {
  CREATE_NEW: '新建棋谱文件',
  UNTITLED: '未命名',
  NOFILE: '无文件',
  FOLDER: '棋谱文件夹',
  FOLDER_INFO: '新棋谱的默认存储路径，如果不存在则会自动创建。',
  ERROR_CREATING_GOBAN: '创建棋谱文件时出错',
  ERROR_OPEN_GOBAN: '打开棋谱文件时出错',
  OPEN_AS_GOBAN: '打开为棋谱文件',
  TOGGLE_MD_GOBAN: '切换为 Markdown / 棋谱',
  CONTENT_INVALID: '棋谱内容无效',
  OPEN_AS_MD: '打开为 Markdown 文件',
  BLACK: '黑方',
  WHITE: '白方',
  GAME_INFO: '对局信息',
  PLAY_MODE: '下棋',
  EDIT_MODE: '编辑',
  VIEW_MODE: '查看',
  CONFIRM: '确定',
  CANCEL: '取消',
  GAME_NAME: '对局名称',
  TOURNAMENT_NAME: '赛事名称',
  DATE: '日期',
  NOTES: '注释',
  GAME_RESULT: '对局结果',
  KOMI: '贴目',
  HANDICAP: '让子',
  GOBAN_SIZE: '棋盘尺寸',
  RANK: '段位',
  SWITCH_GAME: '切换对局',
  EXIT_EDIT: '退出编辑模式',
  CROSS: '叉叉',
  TRIANGLE: '三角',
  SQUARE: '方块',
  CIRCLE: '圆圈',
  NUMBER: '数字',
  ALPHA: '字母',
  STONE: '棋子',
  BLACK_STONE: '黑子',
  WHITE_STONE: '白子',
  CURRENT_SELECT_IS: '当前: ',
  CLICK_TO_TOGGLE: '点击切换',
  EDIT_LABEL: '编辑标记文本',
  RESIGN: '认输',
  SKIP: '停一手',
  NAV: '导航',
  START: '开局',
  ENDING: '终局',
  PREV_BRANCH: '上一分叉',
  NEXT_BRANCH: '下一分叉',
  PREV_COMMENT: '上一评论',
  NEXT_COMMENT: '下一评论',
  PREV_FOCUS: '上一关键点',
  NEXT_FOCUS: '下一关键点',
  VARIATION_BRANCH: '变化树',
  SET_TO_MAIN: '设置为主变化分支',
  MOVE_LEFT: '左移变化分支',
  MOVE_RIGHT: '右移变化分支',
  DELETE_NODE: '删除该节点及之后节点',
  DELETE_NODE_CONFIRM: '这将删除该节点以及之后的所有节点，是否继续？',
  COMMENT: '评论',
  COMMENT_TITLE: '评论标题',
  FINISH: '完成',
  ANNOTATION: '标记',
  CLEAR_ANNOTATION: '清除所有标记',
  DISPLAY_SETTINGS: '显示设置',
  IMPORT_SGF: '导入 SGF 文件',
  TOO_LARGE: '文件过大',
  IMPORT_CONFIRM_TITLE: '导入 SGF 文件到当前棋谱',
  IMPORT_CONFIRM_MSG: '这将覆盖当前棋谱的已有内容，确定吗？',
  EXPORT_SGF: '导出 SGF 文件',
  SELECT_YES: '是',
  SELECT_NO: '否',
  SELECT_INHERIT: '默认',
  GOTO_END_AT_BEGINNING: '打开棋谱时默认跳到对局末尾',
  FUZZY_STONE_PLACEMENT: '棋子显示位置不必严格落在棋盘交叉线上',
  SHOW_NEXT_MOVE: '显示下一手位置',
  SHOW_SIBLINGS: '显示这一手其他可能的选点位置',
  SHOW_SIBLINGS_INFO: '如上一手为分叉点，从上一手到下一手有多个分支，开启这个选项可以显示多个分支的选点',
  SHOW_MOVE_NUMBER: '显示手数',
  SHOW_MOVE_NUMBER_INFO: '显示手数将会覆盖棋上的标记，将导致编辑功能不可用，建议不要默认开启，如果有多个棋谱文件需要仅显示手数，可以在特定棋谱的显示设置中修改，不建议在此做全局设置',
  SHOW_LATS_MOVES: '显示最后 X 手的手数',
  INIT_MODE: '打开棋谱时默认进入的模式',
  INIT_COMMENT_MODE: '打开棋谱时默认进入的评论模式',
  INIT_KOMI: '默认贴目',
  INIT_KOMI_INFO: '填写 0.5 的倍数',
  INIT_HANDICAP: '默认让子',
  INIT_HANDICAP_INFO: '填写 0-9 之间的整数， 0 和 1 都表示不让子',
  INIT_SIZE: '默认棋盘尺寸',
  SHOW_RANGE: '仅使用局部棋盘',
  AXIOS_X: '左到右范围',
  AXIOS_Y: '上到下范围',
  PAGE_SETTINGS_INFO: '该处所有设置仅针对该棋谱生效，会覆盖插件设置中的同名设置项，如果你想在多个棋谱文件中共享该配置，建议新建棋谱文件设置好这里的所有配置项，最后将该棋谱文件作为模版文件，利用 Templater 插件以此模版创建新的文件或手动创建副本以新建棋谱文件',
  AN_GOOD_FOR_BLACK: '黑好',
  AN_UNCLEAR_POSITION: '形势不明',
  AN_EVEN_POSITION: '均势',
  AN_GOOD_FOR_WHITE: '白好',
  AN_GOOD_MOVE: '好棋',
  AN_INTERESTING_MOVE: '有趣的一手',
  AN_DOUBTFUL_MOVE: '问题手',
  AN_BAD_MOVE: '臭棋',
  AN_HOTSPOT: '关键',
  BM_LOW_CHINESE_OPENING: '低中国流',
  BM_HIGH_CHINESE_OPENING: '高中国流',
  BM_ORTHODOX_OPENING: '星+无忧角',
  BM_ENCLOSURE_OPENING: '守角',
  BM_KOBAYASHI_OPENING: '小林流',
  BM_SMALL_CHINESE_OPENING: '变相中国流',
  BM_MICRO_CHINESE_OPENING: '迷你中国流',
  BM_SANRENSEI_OPENING: '三连星',
  BM_NIRENSEI_OPENING: '二连星',
  BM_SHŪSAKU_OPENING: '秀策流',
  BM_LOW_APPROACH: '低挂',
  BM_HIGH_APPROACH: '高挂',
  BM_LOW_ENCLOSURE: '低位守角',
  BM_HIGH_ENCLOSURE: '高位守角',
  BM_MOUTH_SHAPE: '跳方',
  BM_TABLE_SHAPE: '变形跳方',
  BM_TIPPY_TABLE: '斜飞',
  BM_BAMBOO_JOINT: '双',
  BM_TRAPEZIUM: '倒尖',
  BM_DIAMOND: '拔花型',
  'BM_TIGER’S_MOUTH': '虎',
  BM_EMPTY_TRIANGLE: '空三角',
  BM_TURN: '拐',
  BM_STRETCH: '长',
  BM_DIAGONAL: '尖',
  BM_WEDGE: '挖',
  BM_HANE: '扳',
  BM_CUT: '断',
  BM_SQUARE: '正方方阵',
  BM_THROWING_STAR: '小飞方阵',
  BM_PARALLELOGRAM: '错位方阵',
  'BM_DOG’S_HEAD': '猴脸',
  'BM_HORSE’S_HEAD': '马脸',
  BM_ATTACHMENT: '贴',
  'BM_ONE-POINT_JUMP': '跳',
  BM_BIG_BULGE: '小飞方阵少一子',
  BM_SMALL_KNIGHT: '飞',
  'BM_Two-Point_Jump': '大跳',
  BM_LARGE_KNIGHT: '大飞',
  'BM_3-3_POINT_INVASION': '点三三',
  BM_SHOULDER_HIT: '尖冲',
  BM_DIAGONAL_JUMP: '象飞',
  'BM_3-4_POINT': '小目',
  'BM_4-4_POINT': '星位',
  'BM_3-3_POINT': '三三',
  'BM_3-5_POINT': '目外',
  'BM_4-5_POINT': '高目',
  'BM_6-3_POINT': '6-3_点',
  'BM_6-4_POINT': '6-4_点',
  'BM_5-5_POINT': '五五',
  BM_PASS: '停一手',
  BM_TAKE: '提子',
  BM_ATARI: '打',
  BM_SUICIDE: '自杀',
  BM_FILL: '填',
  BM_CONNECT: '粘',
  BM_TENGEN: '天元',
  BM_HOSHI: '星',
  VIEW_IN_SENSEI: '在 Sensei’s Library 上查看文章',
}
