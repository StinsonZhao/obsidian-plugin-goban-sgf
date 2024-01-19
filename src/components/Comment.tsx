import { useContext, useState, useRef, useEffect } from 'preact/hooks'
import { GobanContext } from '@/store/store'
import { t } from '@/lang/helper'
import { setComment, setCommentMode, setSelectedVertices } from '@/store/actions'
import { typographer } from '@/utils/utils'
import AnnotaionIcon from '@/icons/annotation'
import { positionAnnotationOptions, moveAnnotationOptions, hotspotOption } from '@/store/common'
import {
  EvenPosition,
  GoodForBlack,
  UnclearPosition,
  GoodForWhite,
  GoodMove,
  BadMove,
  IntMove,
  DouMove,
  Focus,
} from '@/icons/annos'
import EditIcon from '@/icons/edit'
import QuesIcon from '@/icons/ques'

export interface CommentProps {}

const Icons = {
  GB: GoodForBlack,
  GW: GoodForWhite,
  UC: UnclearPosition,
  DM: EvenPosition,
  TE: GoodMove,
  IT: IntMove,
  DO: DouMove,
  BM: BadMove,
  HO: Focus,
}

const CommentAnno = ({ label, value, name, id, isChecked, onChange }) => {
  const Icon = Icons[value]
  return (
    <div className="whitespace-pre">
      <input
        onChange={onChange}
        hidden
        id={id}
        type="checkbox"
        name={name}
        value={value}
        checked={isChecked}
      />
      <label for={id} className="flex items-center cursor-pointer">
        <div
          className={`flex items-center w-full h-8 whitespace-pre rounded pl-0.5 pr-2 ${
            isChecked
              ? 'bg-[hsl(var(--accent-h),var(--accent-s),96%)] dark:bg-[hsl(var(--accent-h),var(--accent-s),12%)] font-semibold'
              : 'hover:bg-[rgba(0,0,0,0.08)] dark:hover:bg-[rgba(255,255,255,0.08)]'
          }`}
        >
          <div className="flex items-center w-3 h-3 m-2.5">
            <Icon />
          </div>
          {label}
        </div>
      </label>
    </div>
  )
}

const CommentTitle = () => {
  const store = useContext(GobanContext)
  const { curNodeCommentTitle, curAnnos, moveInterpretation } = store
  const hasMoveInterpretation = !!moveInterpretation.value
  const isPlainInterpretation =
    hasMoveInterpretation && typeof moveInterpretation.value === 'string'

  const handleEditButtonClick = () => {
    setCommentMode(store, 'edit')
  }

  const handleMouseEnter = () => {
    if (hasMoveInterpretation && !isPlainInterpretation) {
      setSelectedVertices(store, moveInterpretation.value.matchedVertices)
    }
  }

  const handleMouseLeave = () => {
    if (hasMoveInterpretation && !isPlainInterpretation) {
      setSelectedVertices(store, [])
    }
  }

  const EditPAnnoIcon =
    curAnnos.value.positionAnnotation[0] !== null
      ? Icons[curAnnos.value.positionAnnotation[0]]
      : null
  const EditMAnnoIcon =
    curAnnos.value.moveAnnotation[0] !== null ? Icons[curAnnos.value.moveAnnotation[0]] : null

  return (
    <div className="flex items-start justify-between w-full h-full pl-2">
      <div className="flex items-start">
        {EditPAnnoIcon || EditMAnnoIcon ? (
          <div className="flex items-center h-8 shrink-0">
            {EditPAnnoIcon ? (
              <div className={`w-3.5 h-3.5 relative ${EditMAnnoIcon !== null ? 'mr-4' : 'mr-2'}`}>
                <EditPAnnoIcon />
                <div className="absolute bottom-0 w-4 h-4 origin-bottom-right transform scale-50 -right-2.5">
                  {EditMAnnoIcon !== null ? <EditMAnnoIcon /> : null}
                </div>
              </div>
            ) : null}
            {!EditPAnnoIcon && EditMAnnoIcon ? (
              <div className={`w-3.5 h-3.5 mr-2 relative`}>
                <EditMAnnoIcon />
              </div>
            ) : null}
          </div>
        ) : null}
        <div
          className="grow text-sm font-semibold pt-1.5"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {curNodeCommentTitle.value ? (
            typographer(curNodeCommentTitle.value)
          ) : hasMoveInterpretation ? (
            isPlainInterpretation ? (
              moveInterpretation.value
            ) : (
              <>
                {moveInterpretation.value.patternName}
                {moveInterpretation.value.url ? (
                  <a
                    href={moveInterpretation.value.url}
                    className="inline-block w-3 ml-1 text-[var(--text-faint)] hover:text-[var(--text-accent)] transition"
                    target="_blank"
                    title={t('VIEW_IN_SENSEI')}
                  >
                    <QuesIcon />
                  </a>
                ) : null}
              </>
            )
          ) : null}
        </div>
      </div>
      <div className="ml-2 shrink-0">
        <button
          className="relative z-20 rounded shrink-0 h-8 w-8 p-0 flex items-center justify-center text-[var(--text-muted)] bg-transparent transition shadow-none outline-none hover:bg-[var(--interactive-accent-hover)] hover:text-[var(--text-on-accent)] active:scale-90 border-none cursor-pointer"
          onClick={handleEditButtonClick}
        >
          <div className="w-3 h-3">
            <EditIcon />
          </div>
        </button>
      </div>
    </div>
  )
}

const CommentContent = () => {
  const store = useContext(GobanContext)
  const { curNodeCommentContent } = store

  return <div className="w-full h-full px-2 text-sm">{curNodeCommentContent.value || ''}</div>
}

const Comment = () => {
  const store = useContext(GobanContext)
  const {
    curTreePositionNodeID,
    curNodeCommentTitle,
    curNodeCommentContent,
    commentMode,
    curNode,
    curAnnos,
  } = store

  const handleAnnotation = (e, data) => {
    const checked = e.target.checked
    const d = data
    if (!checked) {
      const [key] = Object.keys(d)
      d[key] = null
    }
    setComment(store, curTreePositionNodeID.value, data)
  }

  const [titleComment, setTitleComment] = useState({
    title: curNodeCommentTitle.value,
    comment: curNodeCommentContent.value,
  })
  const titleRef = useRef<HTMLInputElement>()
  const commentRef = useRef<HTMLTextAreaElement>()
  const timerRef = useRef<any>()
  const cRef = useRef<HTMLDivElement>()

  const handleCommentInput = () => {
    const data = {
      title: titleRef.current?.value,
      comment: commentRef.current?.value,
    }
    setTitleComment(data)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setComment(store, curTreePositionNodeID.value, data)
    }, 500)
  }
  const handleCommentBlur = () => {
    clearTimeout(timerRef.current)
    setComment(store, curTreePositionNodeID.value, {
      title: titleRef.current?.value,
      comment: commentRef.current?.value,
    })
  }

  const uptimerRef = useRef<any>()
  const lastTreePositionNodeIDRef = useRef(curTreePositionNodeID.value)
  useEffect(() => {
    const treePositionChanged = lastTreePositionNodeIDRef.current !== curTreePositionNodeID.value
    if (treePositionChanged) {
      lastTreePositionNodeIDRef.current = curTreePositionNodeID.value
    }

    if (commentMode.value === 'edit') {
      if (cRef.current) {
        cRef.current.scrollTop = 0
      }
      if (treePositionChanged) {
        if (commentRef.current) {
          commentRef.current.scrollTop = 0
        }
        setTitleComment({ title: curNodeCommentTitle.value, comment: curNodeCommentContent.value })
      }
    } else {
      clearTimeout(uptimerRef.current)
      uptimerRef.current = setTimeout(() => {
        if (cRef.current && treePositionChanged) {
          cRef.current.scrollTop = 0
        }
        setTitleComment({ title: curNodeCommentTitle.value, comment: curNodeCommentContent.value })
      }, 200)
    }
  }, [
    curNodeCommentTitle.value,
    curNodeCommentContent.value,
    curTreePositionNodeID.value,
    commentMode.value,
  ])

  const handleConfirm = () => {
    setCommentMode(store, 'view')
  }

  const handleClearAnnotions = () => {
    setComment(store, curTreePositionNodeID.value, {
      positionAnnotation: null,
      moveAnnotation: null,
    })
  }

  const EditPAnnoIcon =
    curAnnos.value.positionAnnotation[0] !== null
      ? Icons[curAnnos.value.positionAnnotation[0]]
      : AnnotaionIcon
  const EditMAnnoIcon =
    curAnnos.value.moveAnnotation[0] !== null ? Icons[curAnnos.value.moveAnnotation[0]] : null

  return (
    <div ref={cRef} className="absolute inset-0 z-10 w-full h-full overflow-y-auto">
      {commentMode.value === 'edit' ? (
        <div className="flex flex-col w-full h-full p-2">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <div className="h-[30px] shrink-0"></div>
            <input
              ref={titleRef}
              type="text"
              className="grow h-[30px]"
              value={titleComment.title}
              placeholder={t('COMMENT_TITLE')}
              onInput={handleCommentInput}
              onBlur={handleCommentBlur}
            />
          </div>
          <div className="flex items-center justify-center w-full grow">
            <textarea
              ref={commentRef}
              className="h-full resize-none grow"
              placeholder={t('COMMENT')}
              value={titleComment.comment}
              onInput={handleCommentInput}
              onBlur={handleCommentBlur}
            />
          </div>
          <div className="h-0 w-full bg-[rgba(0,0,0,0.05)] rounded my-2" />
          <div className="flex items-center justify-between">
            <div className="relative group">
              <div className="absolute -top-1 left-0 whitespace-pre translate-y-[-100%] py-2 px-3 bg-[var(--background-secondary-alt)] text-[var(--text-normal)] transition-all origin-bottom rounded shadow-md text-xs opacity-50 scale-0 border-[var(--background-modifier-border-hover)] border border-solid group-hover:opacity-100 group-hover:scale-100 delay-100 hover:opacity-100 hover:scale-100">
                <div
                  className="flex items-center w-full h-8 cursor-pointer hover:bg-[rgba(0,0,0,0.08)] rounded px-2 dark:hover:bg-[rgba(255,255,255,0.08)]"
                  onClick={handleClearAnnotions}
                >
                  {t('CLEAR_ANNOTATION')}
                </div>
                <div className="h-[1px] w-full border-t border-dashed border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] my-2" />
                <div class="">
                  {positionAnnotationOptions.map((pa) => (
                    <CommentAnno
                      label={pa.label}
                      value={pa.value}
                      name="positionAnnotation"
                      id={pa.value}
                      isChecked={
                        curNode.value?.data?.[pa.value] !== null &&
                        curNode.value?.data?.[pa.value] !== undefined
                      }
                      onChange={(e) => handleAnnotation(e, { positionAnnotation: pa.value })}
                    />
                  ))}
                  {curNode.value?.data.B || curNode.value?.data.W ? (
                    <>
                      <div className="h-[1px] w-full border-t border-dashed border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] my-2" />
                      {moveAnnotationOptions.map((ma) => (
                        <CommentAnno
                          label={ma.label}
                          value={ma.value}
                          name="moveAnnotation"
                          id={ma.value}
                          isChecked={
                            curNode.value?.data?.[ma.value] !== null &&
                            curNode.value?.data?.[ma.value] !== undefined
                          }
                          onChange={(e) => handleAnnotation(e, { moveAnnotation: ma.value })}
                        />
                      ))}
                    </>
                  ) : null}
                  <div className="h-[1px] w-full border-t border-dashed border-[rgba(0,0,0,0.1)] my-2 dark:border-[rgba(255,255,255,0.1)]" />
                  <CommentAnno
                    label={hotspotOption.label}
                    value={hotspotOption.value}
                    name="hotspot"
                    id={hotspotOption.value}
                    isChecked={
                      curNode.value?.data?.[hotspotOption.value] !== null &&
                      curNode.value?.data?.[hotspotOption.value] !== undefined
                    }
                    onChange={(e) => handleAnnotation(e, { hotspot: true })}
                  />
                </div>
              </div>
              <button className="relative z-20 rounded shrink-0 h-8 py-0 pl-2.5 pr-3 flex items-center justify-center text-[var(--text-muted)] bg-[var(--interactive-normal)]transition shadow-none outline-none hover:bg-[var(--interactive-hover)] hover:text-[var(--text-normal)] border border-solid border-[var(--background-modifier-border)] cursor-default">
                {curAnnos.value.isHotspot ? (
                  <div className="w-3.5 h-3.5 mr-2">
                    <Focus />
                  </div>
                ) : null}
                <div className={`w-3.5 h-3.5 relative ${EditMAnnoIcon !== null ? 'mr-4' : 'mr-2'}`}>
                  <EditPAnnoIcon />
                  <div className="absolute bottom-0 w-4 h-4 origin-bottom-right transform scale-50 -right-2.5">
                    {EditMAnnoIcon !== null ? <EditMAnnoIcon /> : null}
                  </div>
                </div>
                {t('ANNOTATION')}
              </button>
            </div>
            <button
              className="rounded shrink-0 h-8 py-0 px-3 flex items-center justify-center text-[var(--text-on-accent)] bg-[var(--interactive-accent)] transition shadow-none outline-none border-none cursor-pointer hover:bg-[var(--interactive-accent-hover)] hover:text-[var(--text-on-accent)] active:scale-90"
              onClick={handleConfirm}
            >
              {t('FINISH')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full h-full p-2">
          <div className="w-full mb-2 shrink-0">
            <CommentTitle />
          </div>
          <div className="w-full grow">
            <CommentContent />
          </div>
        </div>
      )}
    </div>
  )
}

export default Comment
