'use strict'

function normalizeText(str) {
  return str.normalize('NFC')
}

function collapseWhitespace(str) {
  return str.replace(/\s+/g, ' ').trim()
}

function markdownToPlainText(md) {
  return md
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`{1,3}.*?`{1,3}/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

module.exports = { normalizeText, collapseWhitespace, markdownToPlainText }
