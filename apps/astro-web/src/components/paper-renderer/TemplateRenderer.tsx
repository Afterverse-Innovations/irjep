import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import type { JournalTemplateConfig } from "@/lib/template-config";
import type { StructuredPaperData } from "@/lib/paper-data";
import { useTemplateStyles } from "./useTemplateStyles";

// ─── Page size lookup (mm → px at 96 dpi) ────────────────────
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
 * Professional paginated renderer using a sliding-window approach.
 *
 * 1.  All body content is rendered inside a hidden measurement container
 *     in SINGLE-COLUMN mode. Its scrollHeight gives the total linear
 *     content height.
 *
 * 2.  Each page's body capacity = bodyHeight × columnCount.
 *     Page 1 has less body height (title takes space).
 *
 * 3.  Each rendered page has a column container with column-fill: auto
 *     and a fixed height = bodyHeight. Inside, the content div is shifted
 *     upward via margin-top: -offset to skip already-shown content.
 *     column-fill: auto ensures the left column fills completely
 *     before content flows to the right column.
 */
export function TemplateRenderer({ config, data, className = "" }: TemplateRendererProps) {
    const css = useTemplateStyles(config);

    // Measurement refs
    const measureContainerRef = useRef<HTMLDivElement>(null);
    const measureBodyRef = useRef<HTMLDivElement>(null);
    const measureHeaderRef = useRef<HTMLDivElement>(null);
    const measureFooterRef = useRef<HTMLDivElement>(null);
    const measureTitleRef = useRef<HTMLDivElement>(null);

    // Pagination state
    const colCount = config.layout.columnCount || 1;
    const [pageCount, setPageCount] = useState(1);
    const [page1BodyH, setPage1BodyH] = useState(0);
    const [laterBodyH, setLaterBodyH] = useState(0);
    const [columedHeight, setColumedHeight] = useState(0);

    // ─── Token resolver ──────────────────────────────────────
    const resolveTokens = useCallback(
        (text: string, pageNum?: number) => {
            return text
                .replace(/\{\{journalName\}\}/g, config.tokens.journalName)
                .replace(/\{\{year\}\}/g, new Date().getFullYear().toString())
                .replace(/\{\{doi\}\}/g, data.meta.doi ?? "")
                .replace(/\{\{volume\}\}/g, data.meta.volume ?? "")
                .replace(/\{\{issue\}\}/g, data.meta.issue ?? "")
                .replace(/\{\{issn\}\}/g, config.tokens.issn ?? "")
                .replace(/\{\{pageNumber\}\}/g, String(pageNum ?? 1))
                .replace(/\{\{sectionName\}\}/g, "");
        },
        [config.tokens, data.meta]
    );

    // ─── Page dimensions ─────────────────────────────────────
    const pageDims = useMemo(() => {
        const ps = PAGE_SIZES[config.page.size] ?? PAGE_SIZES.A4;
        const isLandscape = config.page.orientation === "landscape";
        return {
            heightPx: (isLandscape ? ps.width : ps.height) * MM_TO_PX,
            marginTopPx: config.page.margins.top * MM_TO_PX,
            marginBottomPx: config.page.margins.bottom * MM_TO_PX,
        };
    }, [config.page]);

    // ─── Auto-number tables ──────────────────────────────────
    const numberedTables = useMemo(() => {
        return data.tables.map((t, i) => ({ ...t, number: i + 1 }));
    }, [data.tables]);

    // ─── Auto-number references ──────────────────────────────
    const numberedRefs = useMemo(() => {
        const start = config.numbering.referenceStartNumber;
        return data.references.map((r, i) => ({
            ...r,
            number: config.reference.autoNumbering ? start + i : r.number,
        }));
    }, [data.references, config.numbering.referenceStartNumber, config.reference.autoNumbering]);

    const endMatter = data.endMatter;

    // ─── Body content (rendered as HTML) ─────────────────────
    const bodyContentJSX = useMemo(() => {
        const parts: React.JSX.Element[] = [];

        // Body sections — normalize in case legacy data has body as a string
        const bodySections = Array.isArray(data.body)
            ? data.body
            : typeof data.body === "string" && data.body
                ? [{ heading: "", content: data.body }]
                : [];
        bodySections.forEach((section, i) => {
            if (section.content) {
                // Split content at page break markers
                const chunks = section.content.split(/<div[^>]*data-page-break[^>]*>[^<]*<\/div>/gi);
                const sectionCols = section.columns !== false; // default true
                chunks.forEach((chunk, ci) => {
                    const trimmed = chunk.trim();
                    if (trimmed) {
                        parts.push(
                            <div key={`section-${i}-${ci}`} className={`paper-section${sectionCols ? '' : ' paper-section-single-col'}`}>
                                <div className="paper-rich-content" dangerouslySetInnerHTML={{ __html: trimmed }} />
                            </div>
                        );
                    }
                    // Insert a page-break marker after each chunk (except the last)
                    if (ci < chunks.length - 1) {
                        parts.push(
                            <div key={`pb-${i}-${ci}`} className="paper-page-break" data-page-break="true" />
                        );
                    }
                });
            }
        });

        // Abstract
        if (data.abstract) {
            // Abstract is already rendered in the title block area, skip here
        }

        // Tables
        numberedTables.forEach((tbl) => {
            parts.push(
                <div key={`table-${tbl.number}`} className="paper-table-block">
                    <div className="paper-table-caption">
                        {config.numbering.tablePrefix} {tbl.number}. {tbl.caption}
                    </div>
                    <table className="paper-table">
                        {tbl.headers.length > 0 && (
                            <thead>
                                <tr>{tbl.headers.map((h, hi) => <th key={hi}>{h}</th>)}</tr>
                            </thead>
                        )}
                        <tbody>
                            {tbl.rows.map((row, ri) => (
                                <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                            ))}
                        </tbody>
                    </table>
                    {tbl.notes && (
                        <div style={{ fontSize: "8pt", fontStyle: "italic", marginTop: "1mm" }}>{tbl.notes}</div>
                    )}
                </div>
            );
        });

        // References
        if (numberedRefs.length > 0) {
            parts.push(
                <div key="references" className="paper-references">
                    <div className="paper-references-heading">References</div>
                    {numberedRefs.map((ref) => (
                        <div key={ref.number} className="paper-reference-item">
                            [{ref.number}] {ref.text}
                        </div>
                    ))}
                </div>
            );
        }

        // End Matter
        if (endMatter) {
            parts.push(
                <div key="endmatter" className="paper-endmatter">
                    {endMatter.contributorParticulars.length > 0 && (
                        <div className="paper-endmatter-section">
                            <div className="paper-endmatter-heading">Particulars of Contributors:</div>
                            {endMatter.contributorParticulars.map((c) => (
                                <div key={c.number} className="paper-endmatter-item">
                                    {c.number}. {c.designation}
                                </div>
                            ))}
                        </div>
                    )}
                    {endMatter.correspondingAuthor.name && (
                        <div className="paper-endmatter-section">
                            <div className="paper-endmatter-heading">
                                Name, Address, E-mail ID of the Corresponding Author:
                            </div>
                            <div className="paper-endmatter-item">{endMatter.correspondingAuthor.name}</div>
                            {endMatter.correspondingAuthor.address && (
                                <div className="paper-endmatter-item">{endMatter.correspondingAuthor.address}</div>
                            )}
                            {endMatter.correspondingAuthor.email && (
                                <div className="paper-endmatter-item">
                                    Email: {endMatter.correspondingAuthor.email}
                                </div>
                            )}
                        </div>
                    )}
                    <div className="paper-endmatter-section">
                        <div className="paper-endmatter-heading">Author Declaration:</div>
                        <div className="paper-endmatter-item">
                            • Financial or Other Competing Interests:{" "}
                            {endMatter.authorDeclaration.competingInterests || "None"}
                        </div>
                        {endMatter.authorDeclaration.ethicsApproval && (
                            <div className="paper-endmatter-item">
                                • Was Ethics Committee Approval obtained?{" "}
                                {endMatter.authorDeclaration.ethicsApproval}
                            </div>
                        )}
                        {endMatter.authorDeclaration.informedConsent && (
                            <div className="paper-endmatter-item">
                                • Was informed consent obtained?{" "}
                                {endMatter.authorDeclaration.informedConsent}
                            </div>
                        )}
                    </div>
                    {endMatter.plagiarismChecking.checkerEntries.length > 0 && (
                        <div className="paper-endmatter-section">
                            <div className="paper-endmatter-heading">Plagiarism Checking Methods:</div>
                            {endMatter.plagiarismChecking.checkerEntries.map((entry, i) => (
                                <div key={i} className="paper-endmatter-item">
                                    • {entry.method}: {entry.date}
                                </div>
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
            parts.push(
                <div key="empty" style={{ color: "#999", fontStyle: "italic", padding: "4mm 0" }}>
                    [No content yet.]
                </div>
            );
        }

        return parts;
    }, [data, config, numberedTables, numberedRefs, endMatter]);

    // ─── Measure columned content height & compute pages ─────
    useEffect(() => {
        const bodyEl = measureBodyRef.current;
        const headerEl = measureHeaderRef.current;
        const footerEl = measureFooterRef.current;
        const titleEl = measureTitleRef.current;
        if (!bodyEl || !headerEl || !footerEl || !titleEl) return;

        const timer = setTimeout(() => {
            // Use offsetHeight — NOT getBoundingClientRect (which is affected by zoom transform)
            const headerH = headerEl.offsetHeight;
            const footerH = footerEl.offsetHeight;
            const titleH = titleEl.offsetHeight;
            // Body is measured WITH columns (column-fill: auto, large height)
            // scrollHeight = the columed height (how tall the columns actually are)
            const bodyScrollH = bodyEl.scrollHeight;

            const totalInner = pageDims.heightPx - pageDims.marginTopPx - pageDims.marginBottomPx;

            // Page 1: header + title + body + footer
            const p1Body = Math.max(0, totalInner - headerH - titleH - footerH);
            // Page 2+: header + body + footer (no title)
            const pNBody = Math.max(0, totalInner - headerH - footerH);

            let pages = 1;
            if (bodyScrollH > p1Body && pNBody > 0) {
                const remaining = bodyScrollH - p1Body;
                pages = 1 + Math.ceil(remaining / pNBody);
            }

            setPage1BodyH(p1Body);
            setLaterBodyH(pNBody);
            setColumedHeight(bodyScrollH);
            setPageCount(pages);
        }, 100);

        return () => clearTimeout(timer);
    }, [data, config, pageDims, bodyContentJSX]);

    // ─── Compute offset for each page (in columned-height terms) ─
    const getPageOffset = (pageIdx: number): number => {
        if (pageIdx === 0) return 0;
        return page1BodyH + (pageIdx - 1) * laterBodyH;
    };

    const getBodyHeight = (pageIdx: number): number => {
        return pageIdx === 0 ? page1BodyH : laterBodyH;
    };

    // ─── Header renderer ─────────────────────────────────────
    const renderHeader = (pageNum: number) => (
        <div className="paper-header">
            {config.header.blocks.map((block, i) => (
                <div key={i} style={{ textAlign: block.alignment }}>
                    {resolveTokens(block.tokens.join(""), pageNum)}
                </div>
            ))}
        </div>
    );

    // ─── Footer renderer ─────────────────────────────────────
    const renderFooter = (pageNum: number, totalPages: number) => (
        <div className="paper-footer">
            <div>{resolveTokens(config.footer.leftContent, pageNum)}</div>
            {config.footer.showPageNumber && (
                <div className="paper-footer-page-number">{pageNum} / {totalPages}</div>
            )}
            <div>{resolveTokens(config.footer.rightContent, pageNum)}</div>
        </div>
    );

    // ─── Title block (page 1 only) ───────────────────────────
    const titleBlock = (
        <div className="paper-title-block">
            <div className="paper-title">{data.title || "Untitled Paper"}</div>
            <div className="paper-authors">
                {data.authors.map((a, i) => (
                    <span key={i}>
                        {a.name}
                        {a.isCorresponding && <sup>*</sup>}
                        {i < data.authors.length - 1 && ", "}
                    </span>
                ))}
            </div>
            {data.authors.some((a) => a.affiliation) && (
                <div className="paper-affiliations">
                    {[...new Set(data.authors.map((a) => a.affiliation).filter(Boolean))].join("; ")}
                </div>
            )}
            {/* Abstract inside the title block (spans all columns) */}
            {data.abstract && (
                <div className="paper-abstract-block">
                    <div className="paper-abstract-label">{config.abstract.labelText}</div>
                    <div className="paper-rich-content" dangerouslySetInnerHTML={{ __html: data.abstract }} />
                </div>
            )}
            {/* Keywords */}
            {data.keywords.length > 0 && (
                <div className="paper-keywords">
                    <span className="paper-keywords-label">Keywords: </span>
                    {data.keywords.join(", ")}
                </div>
            )}
        </div>
    );

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            {/* ─── Hidden Measurement Container ─────────────── */}
            {/* Full-width column layout applied. scrollHeight of the body
                div gives us the total columned content height. */}
            <div
                ref={measureContainerRef}
                className={`paper-page paper-measure ${className}`}
                aria-hidden="true"
                style={{
                    position: "absolute",
                    left: "-9999px",
                    top: 0,
                    visibility: "hidden",
                    pointerEvents: "none",
                }}
            >
                <div ref={measureHeaderRef}>{renderHeader(1)}</div>
                <div ref={measureTitleRef}>{titleBlock}</div>
                <div ref={measureBodyRef} className="paper-body paper-measure-body">
                    {bodyContentJSX}
                </div>
                <div ref={measureFooterRef}>{renderFooter(1, 1)}</div>
            </div>

            {/* ─── Rendered Pages ───────────────────────────── */}
            <div className="paper-paged-wrapper">
                {Array.from({ length: pageCount }, (_, pageIdx) => {
                    const offset = getPageOffset(pageIdx);
                    const bodyHeight = getBodyHeight(pageIdx);

                    return (
                        <div key={pageIdx} className={`paper-page ${className}`}>
                            {/* Header */}
                            {renderHeader(pageIdx + 1)}

                            {/* Title block only on page 1 */}
                            {pageIdx === 0 && titleBlock}

                            {/* Body — clip container with absolute-positioned columned content */}
                            <div
                                className="paper-page-clip"
                                style={{ height: bodyHeight }}
                            >
                                <div
                                    className="paper-page-body-inner"
                                    style={{ top: -offset, height: columedHeight }}
                                >
                                    {bodyContentJSX}
                                </div>
                            </div>

                            {/* Footer */}
                            {renderFooter(pageIdx + 1, pageCount)}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
