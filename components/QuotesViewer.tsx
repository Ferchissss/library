// components/QuotesViewer.tsx
import { HtmlViewer, type HtmlViewerProps } from './quotes/HtmlViewer'

export function QuotesViewer(props: Omit<HtmlViewerProps, 'theme'>) {
  return <HtmlViewer {...props} theme="purple" />
}