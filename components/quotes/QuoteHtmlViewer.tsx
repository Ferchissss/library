import { HtmlViewer, type HtmlViewerProps } from './HtmlViewer'

export function QuoteHtmlViewer(props: Omit<HtmlViewerProps, 'theme'>) {
  return <HtmlViewer {...props} theme="green" />
}