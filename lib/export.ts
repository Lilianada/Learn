import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export async function exportToPDF(content: string, filename: string) {
  // Create a temporary div to render the content
  const tempDiv = document.createElement("div")
  tempDiv.className = "prose max-w-none p-8"
  tempDiv.innerHTML = content
  tempDiv.style.position = "absolute"
  tempDiv.style.left = "-9999px"
  tempDiv.style.backgroundColor = "white"
  tempDiv.style.width = "800px"
  document.body.appendChild(tempDiv)

  try {
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const imgWidth = 210 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let position = 0

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)

    // If the content is longer than one page, add more pages
    const pageHeight = 295 // A4 height in mm

    while (position < imgHeight) {
      position += pageHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, -position, imgWidth, imgHeight)
    }

    pdf.save(`${filename}.pdf`)
  } finally {
    document.body.removeChild(tempDiv)
  }
}

export function exportToMarkdown(content: string, filename: string) {
  // Simple function to strip HTML and keep basic markdown-like formatting
  const markdownContent = content
    .replace(/<h1>(.*?)<\/h1>/g, "# $1\n\n")
    .replace(/<h2>(.*?)<\/h2>/g, "## $1\n\n")
    .replace(/<h3>(.*?)<\/h3>/g, "### $1\n\n")
    .replace(/<p>(.*?)<\/p>/g, "$1\n\n")
    .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
    .replace(/<em>(.*?)<\/em>/g, "*$1*")
    .replace(/<code>(.*?)<\/code>/g, "`$1`")
    .replace(/<pre>(.*?)<\/pre>/g, "```\n$1\n```\n\n")
    .replace(/<ul>(.*?)<\/ul>/g, "$1\n")
    .replace(/<li>(.*?)<\/li>/g, "- $1\n")
    .replace(/<ol>(.*?)<\/ol>/g, "$1\n")
    .replace(/<li>(.*?)<\/li>/g, "1. $1\n")
    .replace(/<blockquote>(.*?)<\/blockquote>/g, "> $1\n\n")
    .replace(/<a href="(.*?)">(.*?)<\/a>/g, "[$2]($1)")
    .replace(/<br>/g, "\n")
    .replace(/<[^>]*>/g, "") // Remove any remaining HTML tags

  // Create a download link
  const blob = new Blob([markdownContent], { type: "text/markdown" })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.md`
  document.body.appendChild(a)
  a.click()
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 0)
}
