# Goban SGF for Obsidian

**Goban SGF for Obsidian** 是一个用于在 Obsidian 上管理棋谱的插件，背后支持的棋谱格式是 
[SGF](https://en.wikipedia.org/wiki/Smart_Game_Format)，该插件移植了和参考了大部分 [Sabaki](https://github.com/SabakiHQ/Sabaki) 的功能和 UI（去掉了所有引擎、分析相关的功能）。

![Plugin-Img](./assets/goban-sgf.jpg)

该插件的目的是为了帮助学习围棋的朋友，现在他们可以使用该插件在 Obsidian 上研究对局、死活题，像管理普通笔记那样管理棋谱，像学习其他知识一样记笔记。


## Feature
- [Sabaki](https://github.com/SabakiHQ/Sabaki) 的基础功能，可以称之为 **Sabaki-Lite**
  - 下棋：支持多分支，支持变化树
  - 编辑：可添加各种常用标记
  - 评论
  - 自由导航
- SGF 棋谱文件的导入和导出
- 设置的灵活性，插件有设置，还可以将设置细粒度到文件级别（通过 frontmatter 字段实现）
- 支持显示局部棋盘（对于研究死活题比较有用）
- 支持 `sgf` 格式的代码块渲染，即可以在在普通的 MD 文档中插入 `sgf` 的代码块，即可渲染内嵌的只读棋盘
- 支持亮/暗两种模式的 UI


## How to
- 新建棋谱文件：
  - 你可以通过 Obsidian 最左边找到一个像“铜板”的图标，点击即可新建
  - 还可以通过 Obsidian 的全局命令找到新建棋谱文件
  - 可以通过在侧边栏的文件夹上右键，在菜单中找到“新建棋谱文件”
- 新建棋谱后：
  - 如果你有已有的 SGF 格式棋谱要导入，可以通过左下角的菜单项中点击”导入 SGF 文件“来立马导入棋谱
  - 可以像下围棋一样，一步一步落子
  - 可以在任意时候切换到“编辑模式”，从而能对棋盘、棋子做标记
  - 可以在任意时候打开“评论”编辑，从而添加评论、好坏手标记
- 导航：
  - 可以通过棋盘下方的进度条导航
  - 可以通过键盘方向键导航
  - 可以把鼠标放到棋盘上滚动鼠标中键导航
  - 可以在变化树中拖动然后点击某个变化点导航
  - 可以在变化树的右上角通过菜单快速导航到一些标志点
- 存为模版：
  - 可以新建一个棋谱文件后，在左下角菜单项中点开显示设置
  - 设置好你需要的默认配置后，将该棋谱文件放到你的 Obsidian 模版文件夹
  - 下次你需要相同的配置时，可以借由 **Templater** 这样的插件来自动基于该模版生成新文件，也可以手动 Copy 一份以建立新文件


## Development
- 克隆该代码库
- 运行 `pnpm install` 以安装依赖
- 运行 `pnpm run dev` 以 watch 源码改动
- 使你的 obsidian 能访问到该插件，**强烈建议使用一个开发用的空 Obsidian Vault**，而不是用你日常使用的用来记笔记的正式 vault，具体可以通过建立软链接的方式。
- `ln -s /path/to/your/<plugin-repo> /path/to/your/obsidian/vault/.obsidian/plugins/<plugin-name>`


## Thanks
感谢 [Sabaki](https://github.com/SabakiHQ/Sabaki) 项目以及所有相关开发者，要是没有你们，我可能需要做非常非常多的工作来实现这个插件，感谢你们开发了如此好的围棋工具并且愿意开源。


## License
这个项目是基于 [MIT 许可](./LICENSE.md)


## Lang
项目中英文、韩文和日文都是借由翻译工具自动翻译的，如有问题，欢迎指正。