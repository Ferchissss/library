// components/QuotesEditor.tsx
import { TipTapEditor, type TipTapEditorProps } from './quotes/TipTapEditor'

export function QuotesEditor(props: Omit<TipTapEditorProps, 'theme'>) {
  return <TipTapEditor {...props} theme="purple" />
}