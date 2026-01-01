import { TipTapEditor } from './TipTapEditor'
import type { TipTapEditorProps } from './TipTapEditor'

export function QuoteTipTapEditor(props: Omit<TipTapEditorProps, 'theme'>) {
  return <TipTapEditor {...props} theme="green" />
}