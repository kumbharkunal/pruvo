const COMPOUNDS = /(new-car|pre-owned|pre-delivery|pre-purchase)/gi;

/**
 * Keeps hyphenated compounds on one line ("pre-owned" never breaks as "pre-/owned"). The real hyphen
 * stays in the text, so search and copy-paste still match.
 */
export function keep(text: string): React.ReactNode {
  return text.split(COMPOUNDS).map((part, i) =>
    i % 2 ? (
      <span key={i} className="nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}
