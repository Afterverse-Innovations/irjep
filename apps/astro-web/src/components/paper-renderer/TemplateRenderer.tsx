import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import type { JournalTemplateConfig } from "@/lib/template-config";
import type { StructuredPaperData } from "@/lib/paper-data";
import { useTemplateStyles } from "./useTemplateStyles";

const MM_TO_PX = 3.7795;
const PAGE_SIZES: Record<string, { width: number; height: number }> = {
    A4: { width: 210, height: 297 },
    Letter: { width: 215.9, height: 279.4 },
    A5: { width: 148, height: 210 },
    B5: { width: 176, height: 250 },
};

interface TemplateRendererProps {
    config: JournalTemplateConfig;
    data: StructuredPaperData;
    className?: string;
}

/**
 * Paginated paper renderer.
 *
 * Architecture:
 *   - Title block (title, authors, affiliations, keywords) is rendered
 *     OUTSIDE of columns on page 1 only.
 *   - Body stream (abstract, body sections, references, metadata) flows
 *     in a single columned container with column-fill: auto.
 *   - column-fill: auto fills LEFT column first, then RIGHT.
 *   - For page N, we apply margin-top: -(N × colCount × bodyCapacity)
 *     so content naturally restarts from the left column.
 *   - Body content is measured at COLUMN WIDTH (not full page width)
 *     to get accurate single-column height for pagination math.
 */
export function TemplateRenderer({ config, data, className = "" }: TemplateRendererProps) {
    const css = useTemplateStyles(config);

    // Measurement refs
    const measurePageRef = useRef<HTMLDivElement>(null);
    const measureHeaderRef = useRef<HTMLDivElement>(null);
    const measureFooterRef = useRef<HTMLDivElement>(null);
    const measureTitleRef = useRef<HTMLDivElement>(null);
    const measureBodyRef = useRef<HTMLDivElement>(null);

    // Pagination state
    const [pageCount, setPageCount] = useState(1);
    const [titleH, setTitleH] = useState(0);
    const [bodyCapacity1, setBodyCapacity1] = useState(0); // page 1
    const [bodyCapacityN, setBodyCapacityN] = useState(0); // page 2+
    const [bodySingleColH, setBodySingleColH] = useState(0);

    const colCount = config.layout.columnCount;

    // Token resolver
    const resolveTokens = useCallback(
        (text: string, pageNum?: number) => {
            return text
                .replace(/\{\{journalName\}\}/g, config.tokens.journalName)
                .replace(/\{\{year\}\}/g, new Date().getFullYear().toString())
                .replace(/\{\{doi\}\}/g, data.meta.doi ?? "")
                .replace(/\{\{articleTitle\}\}/g, data.title || "")
                .replace(/\{\{firstAuthor\}\}/g, data.authors?.[0]?.name || "")
                .replace(/\{\{volume\}\}/g, data.meta.volume ?? "")
                .replace(/\{\{issue\}\}/g, data.meta.issue ?? "")
                .replace(/\{\{issn\}\}/g, config.tokens.issn ?? "")
                .replace(/\{\{pageNumber\}\}/g, String(pageNum ?? 1))
                .replace(/\{\{sectionName\}\}/g, "");
        },
        [config.tokens, data.meta]
    );

    // Page dimensions
    const pageDims = useMemo(() => {
        const ps = PAGE_SIZES[config.page.size] ?? PAGE_SIZES.A4;
        const isLandscape = config.page.orientation === "landscape";
        const wMm = isLandscape ? ps.height : ps.width;
        const hMm = isLandscape ? ps.width : ps.height;
        const contentWMm = wMm - config.page.margins.left - config.page.margins.right;
        const colWidthMm = (contentWMm - (colCount - 1) * config.layout.columnGap) / colCount;
        return {
            heightPx: hMm * MM_TO_PX,
            marginTopPx: config.page.margins.top * MM_TO_PX,
            marginBottomPx: config.page.margins.bottom * MM_TO_PX,
            colWidthPx: colWidthMm * MM_TO_PX,
        };
    }, [config.page, config.layout, colCount]);

    // Auto-number refs & tables
    const numberedRefs = useMemo(() => {
        const start = config.numbering.referenceStartNumber;
        return (data.references ?? []).map((r, i) => ({
            ...r, number: config.reference.autoNumbering ? start + i : r.number,
        }));
    }, [data.references, config.numbering.referenceStartNumber, config.reference.autoNumbering]);

    const numberedTables = useMemo(() =>
        (data.tables ?? []).map((t, i) => ({ ...t, number: i + 1 })),
        [data.tables]);

    const endMatter = data.endMatter;

    // ─── Title block JSX (page 1 only, outside columns) ──────
    const titleBlockJSX = useMemo(() => (
        <div className="paper-title-block">
            {config.layout.showMetaHeader && (
                <div className="paper-meta-header">
                    <span>{data.meta.doi ? `DOI: ${data.meta.doi}` : ""}</span>
                    <span>{data.meta.articleType || "Article"}</span>
                </div>
            )}
            <div className="paper-title">{data.title || "Untitled Paper"}</div>
            <div className="paper-authors">
                {data.authors.map((a, i) => (
                    <span key={i}>
                        {a.name.toUpperCase()}<sup>{i + 1}{a.isCorresponding && "*"}</sup>
                        {i < data.authors.length - 1 && ", "}
                    </span>
                ))}
            </div>
            {config.layout.showTitleSeparator && <div className="paper-title-separator" />}
            {data.authors.some(a => a.affiliation) && (
                <div className="paper-affiliations">
                    {[...new Set(data.authors.map(a => a.affiliation).filter(Boolean))].join("; ")}
                </div>
            )}
            {/* Abstract — own 2-column section */}
            {data.abstract && (
                <div className="paper-abstract-columns">
                    <div className="paper-abstract-label">{config.abstractLabel.labelText}</div>
                    <div className="paper-rich-content" dangerouslySetInnerHTML={{ __html: data.abstract }} />
                </div>
            )}
            {/* Keywords — full width, after abstract */}
            {data.keywords.length > 0 && (
                <div className="paper-keywords">
                    <span className="paper-keywords-label">Keywords: </span>
                    {data.keywords.join(", ")}
                </div>
            )}
        </div>
    ), [data.title, data.authors, data.keywords, data.abstract, config.abstractLabel.labelText]);

    // ─── Body stream JSX (body + refs + metadata — no abstract) ─
    const bodyStreamJSX = useMemo(() => {
        const parts: React.JSX.Element[] = [];

        // Body sections
        const bodySections = Array.isArray(data.body)
            ? data.body
            : typeof data.body === "string" && data.body
                ? [{ heading: "", content: data.body }] : [];
        bodySections.forEach((section, i) => {
            if (section.content) {
                parts.push(
                    <div key={`body-${i}`} className="paper-body-section">
                        <div className="paper-rich-content" dangerouslySetInnerHTML={{ __html: section.content }} />
                    </div>
                );
            }
        });

        // Tables
        numberedTables.forEach(tbl => {
            parts.push(
                <div key={`table-${tbl.number}`} className="paper-table-block">
                    <div className="paper-table-caption">
                        {config.numbering?.tablePrefix ?? "Table"} {tbl.number}. {tbl.caption}
                    </div>
                    <table className="paper-table">
                        {(tbl.headers ?? []).length > 0 && (
                            <thead><tr>{tbl.headers.map((h, hi) => <th key={hi}>{h}</th>)}</tr></thead>
                        )}
                        <tbody>
                            {(tbl.rows ?? []).map((row, ri) => (
                                <tr key={ri}>{(row ?? []).map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                            ))}
                        </tbody>
                    </table>
                    {tbl.notes && <div style={{ fontSize: "8pt", fontStyle: "italic", marginTop: "1mm" }}>{tbl.notes}</div>}
                </div>
            );
        });

        // References
        if (numberedRefs.length > 0) {
            parts.push(
                <div key="references" className="paper-references">
                    <div className="paper-references-heading">References</div>
                    {numberedRefs.map(ref => (
                        <div key={ref.number} className="paper-reference-item">
                            <span className="paper-reference-number">[{ref.number}]</span> {ref.text}
                        </div>
                    ))}
                </div>
            );
        }

        // End matter
        if (endMatter) {
            parts.push(
                <div key="endmatter" className="paper-endmatter">
                    {endMatter.contributorParticulars.length > 0 && (
                        <div className="paper-endmatter-section">
                            <div className="paper-endmatter-heading">Particulars of Contributors:</div>
                            {endMatter.contributorParticulars.map(c => (
                                <div key={c.number} className="paper-endmatter-item">{c.number}. {c.designation}</div>
                            ))}
                        </div>
                    )}
                    {endMatter.correspondingAuthor.name && (
                        <div className="paper-endmatter-section">
                            <div className="paper-endmatter-heading">Name, Address, E-mail ID of the Corresponding Author:</div>
                            <div className="paper-endmatter-item">{endMatter.correspondingAuthor.name}</div>
                            {endMatter.correspondingAuthor.address && <div className="paper-endmatter-item">{endMatter.correspondingAuthor.address}</div>}
                            {endMatter.correspondingAuthor.email && <div className="paper-endmatter-item">Email: {endMatter.correspondingAuthor.email}</div>}
                        </div>
                    )}
                    <div className="paper-endmatter-section">
                        <div className="paper-endmatter-heading">Author Declaration:</div>
                        <div className="paper-endmatter-item">• Financial or Other Competing Interests: {endMatter.authorDeclaration.competingInterests || "None"}</div>
                        {endMatter.authorDeclaration.ethicsApproval && <div className="paper-endmatter-item">• Was Ethics Committee Approval obtained? {endMatter.authorDeclaration.ethicsApproval}</div>}
                        {endMatter.authorDeclaration.informedConsent && <div className="paper-endmatter-item">• Was informed consent obtained? {endMatter.authorDeclaration.informedConsent}</div>}
                    </div>
                    {endMatter.plagiarismChecking.checkerEntries.length > 0 && (
                        <div className="paper-endmatter-section">
                            <div className="paper-endmatter-heading">Plagiarism Checking Methods:</div>
                            {endMatter.plagiarismChecking.checkerEntries.map((entry, i) => (
                                <div key={i} className="paper-endmatter-item">• {entry.method}: {entry.date}</div>
                            ))}
                        </div>
                    )}
                    {endMatter.pharmacology && (
                        <div className="paper-endmatter-section">
                            <div className="paper-endmatter-heading">Pharmacology:</div>
                            <div className="paper-endmatter-item">{endMatter.pharmacology}</div>
                        </div>
                    )}
                    {endMatter.emendations && (
                        <div className="paper-endmatter-section">
                            <div className="paper-endmatter-heading">Emendations: {endMatter.emendations}</div>
                        </div>
                    )}
                    <div className="paper-endmatter-dates">
                        {endMatter.dateOfSubmission && <div>Date of Submission: {endMatter.dateOfSubmission}</div>}
                        {endMatter.dateOfPeerReview && <div>Date of Peer Review: {endMatter.dateOfPeerReview}</div>}
                        {endMatter.dateOfAcceptance && <div>Date of Acceptance: {endMatter.dateOfAcceptance}</div>}
                        {endMatter.dateOfPublishing && <div>Date of Publishing: {endMatter.dateOfPublishing}</div>}
                    </div>
                </div>
            );
        }

        if (parts.length === 0) {
            parts.push(<div key="empty" style={{ color: "#999", fontStyle: "italic", padding: "4mm 0" }}>[No content yet.]</div>);
        }
        return parts;
    }, [data, config, numberedTables, numberedRefs, endMatter]);

    // ─── Measure & paginate ──────────────────────────────────
    useEffect(() => {
        const headerEl = measureHeaderRef.current;
        const footerEl = measureFooterRef.current;
        const titleEl = measureTitleRef.current;
        const bodyEl = measureBodyRef.current;
        if (!headerEl || !footerEl || !titleEl || !bodyEl) return;

        const timer = setTimeout(() => {
            const headerH = headerEl.offsetHeight;
            const footerH = footerEl.offsetHeight;
            const titleBlockH = titleEl.offsetHeight;
            // Body measured at column width → single-col height at column width
            const bodyH = bodyEl.scrollHeight;

            const totalInner = pageDims.heightPx - pageDims.marginTopPx - pageDims.marginBottomPx;
            // 3mm gap between header/title and body columns (matches CSS margin-top)
            const bodyGapPx = 3 * 3.7795;
            // Page 1: header + title + gap + body columns + footer
            const cap1 = Math.max(0, totalInner - headerH - titleBlockH - bodyGapPx - footerH);
            // Page 2+: header + gap + body columns + footer
            const capN = Math.max(0, totalInner - headerH - bodyGapPx - footerH);

            // Each page shows colCount × capacity of single-col content
            const contentOnPage1 = colCount * cap1;
            let remaining = bodyH - contentOnPage1;
            let pages = 1;
            if (remaining > 0 && capN > 0) {
                const contentPerPageN = colCount * capN;
                pages = 1 + Math.ceil(remaining / contentPerPageN);
            }

            setTitleH(titleBlockH);
            setBodyCapacity1(cap1);
            setBodyCapacityN(capN);
            setBodySingleColH(bodyH);
            setPageCount(pages);
        }, 150);
        return () => clearTimeout(timer);
    }, [data, config, pageDims, colCount, bodyStreamJSX, titleBlockJSX]);

    // ─── Compute margin-top offset for body on each page ─────
    const getBodyOffset = (pageIdx: number): number => {
        if (pageIdx === 0) return 0;
        // Page 1 consumed colCount × bodyCapacity1
        const page1Content = colCount * bodyCapacity1;
        if (pageIdx === 1) return page1Content;
        return page1Content + (pageIdx - 1) * colCount * bodyCapacityN;
    };

    const getBodyContainerH = (pageIdx: number): number => {
        return pageIdx === 0 ? bodyCapacity1 : bodyCapacityN;
    };

    // ─── Header ──────────────────────────────────────────────
    const renderHeader = (pageNum: number) => (
        <div className="paper-header">
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <div style={{ textAlign: "left" }}>
                    {resolveTokens(config.header.leftContent || "", pageNum)}
                </div>
                <div style={{ textAlign: "right" }}>
                    {resolveTokens(config.header.rightContent || "", pageNum)}
                </div>
            </div>
        </div>
    );

    // ─── Footer ──────────────────────────────────────────────
    const renderFooter = (pageNum: number, totalPages: number) => (
        <div className="paper-footer">
            <div>{resolveTokens(config.footer.leftContent, pageNum)}</div>
            {config.footer.showPageNumber && (
                <div className="paper-footer-page-number">{pageNum} / {totalPages}</div>
            )}
            <div>{resolveTokens(config.footer.rightContent, pageNum)}</div>
        </div>
    );

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            {/* ─── Hidden Measurement Area ─────────────────── */}
            <div
                ref={measurePageRef}
                className={`paper-page paper-measure ${className}`}
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", top: 0, visibility: "hidden", pointerEvents: "none" }}
            >
                <div ref={measureHeaderRef}>{renderHeader(1)}</div>
                <div ref={measureTitleRef}>{titleBlockJSX}</div>
                {/* Measure body at COLUMN WIDTH for accurate single-col height */}
                <div ref={measureBodyRef} style={{ width: pageDims.colWidthPx }}>
                    {bodyStreamJSX}
                </div>
                <div ref={measureFooterRef}>{renderFooter(1, 1)}</div>
            </div>

            {/* ─── Rendered Pages ─────────────────────────── */}
            <div className="paper-paged-wrapper">
                {Array.from({ length: pageCount }, (_, pageIdx) => {
                    const offset = getBodyOffset(pageIdx);
                    const containerH = getBodyContainerH(pageIdx);

                    return (
                        <div key={pageIdx} className={`paper-page ${className}`}>
                            {renderHeader(pageIdx + 1)}

                            {/* Title block on page 1 only */}
                            {pageIdx === 0 && titleBlockJSX}

                            {/* Body — columned container with margin-top offset */}
                            <div className="paper-body-columns" style={{ height: containerH }}>
                                <div style={{ marginTop: -offset }}>
                                    {bodyStreamJSX}
                                </div>
                            </div>

                            {renderFooter(pageIdx + 1, pageCount)}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
