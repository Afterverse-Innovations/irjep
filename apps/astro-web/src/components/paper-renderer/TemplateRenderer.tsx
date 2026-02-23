import { useMemo, useRef, useState, useEffect, useCallback, type ReactNode } from "react";
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
 * Professional paginated renderer.
 *
 * Approach:
 * 1. All content is split into discrete "blocks" (title, abstract, sections, etc.)
 * 2. Blocks are rendered in a hidden single-column measurement container
 *    to get their natural heights.
 * 3. Blocks are distributed greedily across pages. For multi-column layouts,
 *    each page can hold `usableHeight × columnCount` worth of single-column
 *    content because CSS columns fill horizontally first.
 * 4. Each rendered page gets its own column container (column-fill: auto)
 *    with only the blocks assigned to that page.
 * 5. Every page has its own header, footer, and page number.
 */
export function TemplateRenderer({ config, data, className = "" }: TemplateRendererProps) {
    const css = useTemplateStyles(config);
    const measureRef = useRef<HTMLDivElement>(null);
    const measureHeaderRef = useRef<HTMLDivElement>(null);
    const measureFooterRef = useRef<HTMLDivElement>(null);
    const measureTitleRef = useRef<HTMLDivElement>(null);

    // pages[i] = array of block indices assigned to page i
    const [pages, setPages] = useState<number[][]>([[/* all on page 1 initially */]]);
    const [measured, setMeasured] = useState(false);

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

    // ─── Build content blocks ────────────────────────────────
    // Each block gets a stable `data-block` attr for measurement matching.
    const contentBlocks: ReactNode[] = useMemo(() => {
        const blocks: ReactNode[] = [];

        // Abstract
        if (data.abstract) {
            blocks.push(
                <div data-block={blocks.length} key="abstract" className="paper-abstract-block">
                    <div className="paper-abstract-label">{config.abstract.labelText}</div>
                    <div className="paper-rich-content" dangerouslySetInnerHTML={{ __html: data.abstract }} />
                </div>
            );
        }

        // Keywords
        if (data.keywords.length > 0) {
            blocks.push(
                <div data-block={blocks.length} key="keywords" className="paper-keywords">
                    <span className="paper-keywords-label">Keywords: </span>
                    {data.keywords.join(", ")}
                </div>
            );
        }

        // Body sections
        data.body.forEach((section, i) => {
            blocks.push(
                <div data-block={blocks.length} key={`section-${i}`} className="paper-section">
                    <div className="paper-section-heading">{section.heading}</div>
                    {section.content ? (
                        <div className="paper-rich-content" dangerouslySetInnerHTML={{ __html: section.content }} />
                    ) : (
                        <div className="paper-paragraph" style={{ color: "#999", fontStyle: "italic" }}>
                            [Section content not yet provided]
                        </div>
                    )}
                    {section.subsections?.map((sub, j) => (
                        <div key={j} style={{ marginTop: "3mm" }}>
                            <div style={{
                                fontWeight: "bold",
                                fontSize: `${config.typography.sectionHeadingFontSize - 1}pt`,
                            }}>
                                {sub.heading}
                            </div>
                            {sub.content && (
                                <div className="paper-rich-content" dangerouslySetInnerHTML={{ __html: sub.content }} />
                            )}
                        </div>
                    ))}
                </div>
            );
        });

        // Tables
        numberedTables.forEach((tbl) => {
            blocks.push(
                <div data-block={blocks.length} key={`table-${tbl.number}`} className="paper-table-block">
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
            blocks.push(
                <div data-block={blocks.length} key="references" className="paper-references">
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
            blocks.push(
                <div data-block={blocks.length} key="endmatter" className="paper-endmatter">
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

        // Empty state
        if (blocks.length === 0) {
            blocks.push(
                <div data-block={0} key="empty" style={{ color: "#999", fontStyle: "italic", padding: "4mm 0" }}>
                    [No content sections added yet.]
                </div>
            );
        }

        return blocks;
    }, [data, config, numberedTables, numberedRefs, endMatter]);

    // ─── Measure + distribute blocks across pages ────────────
    useEffect(() => {
        const container = measureRef.current;
        const headerEl = measureHeaderRef.current;
        const footerEl = measureFooterRef.current;
        const titleEl = measureTitleRef.current;
        if (!container || !headerEl || !footerEl || !titleEl) return;

        const timer = setTimeout(() => {
            // IMPORTANT: Use offsetHeight, NOT getBoundingClientRect().height.
            // The measurement container is inside PaperPreview's transform: scale(zoom)
            // and getBoundingClientRect returns SCALED dimensions, making everything
            // appear to fit on one page. offsetHeight is unaffected by CSS transforms.
            const headerH = headerEl.offsetHeight;
            const footerH = footerEl.offsetHeight;
            const titleH = titleEl.offsetHeight;

            const totalInnerH = pageDims.heightPx - pageDims.marginTopPx - pageDims.marginBottomPx;
            const colCount = config.layout.columnCount;

            // Page 1 usable body area (less space due to title)
            // Multiply by column count: 2 columns = 2× content height capacity
            const page1Capacity = (totalInnerH - headerH - titleH - footerH) * colCount;
            // Page 2+ usable body area (no title)
            const laterCapacity = (totalInnerH - headerH - footerH) * colCount;

            // Measure each block at column width (single-column mode)
            const blocks = container.querySelectorAll<HTMLElement>("[data-block]");
            const heights: number[] = [];
            blocks.forEach((b) => heights.push(b.offsetHeight));

            // Greedy distribution
            const pageGroups: number[][] = [];
            let currentPage: number[] = [];
            let currentHeight = 0;
            let isFirstPage = true;

            for (let i = 0; i < heights.length; i++) {
                const cap = isFirstPage ? page1Capacity : laterCapacity;

                if (currentHeight + heights[i] > cap && currentPage.length > 0) {
                    // This block doesn't fit — start new page
                    pageGroups.push(currentPage);
                    currentPage = [i];
                    currentHeight = heights[i];
                    isFirstPage = false;
                } else {
                    currentPage.push(i);
                    currentHeight += heights[i];
                }
            }

            if (currentPage.length > 0) {
                pageGroups.push(currentPage);
            }

            // Fallback
            if (pageGroups.length === 0) {
                pageGroups.push(Array.from({ length: heights.length }, (_, i) => i));
            }

            setPages(pageGroups);
            setMeasured(true);
        }, 100);

        return () => clearTimeout(timer);
    }, [data, config, pageDims, contentBlocks]);

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

    // ─── Title block (page 1 only, spans all columns) ────────
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
        </div>
    );

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            {/* ─── Hidden Measurement Container ─────────────── */}
            {/* Single-column measurement: no CSS columns applied.
                Blocks are measured in their natural single-column height.
                We then multiply usable page height by column count
                to determine how many blocks fit per page. */}
            <div
                ref={measureRef}
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
                {/* Blocks measured in single-column layout */}
                <div className="paper-body-measure">
                    {contentBlocks}
                </div>
                <div ref={measureFooterRef}>{renderFooter(1, 1)}</div>
            </div>

            {/* ─── Rendered Pages ───────────────────────────── */}
            <div className="paper-paged-wrapper">
                {pages.map((blockIndices, pageIdx) => (
                    <div key={pageIdx} className={`paper-page ${className}`}>
                        {/* Header */}
                        {renderHeader(pageIdx + 1)}

                        {/* Title block only on page 1, above columns */}
                        {pageIdx === 0 && titleBlock}

                        {/* Body — applies column layout to this page's blocks */}
                        <div className="paper-body paper-page-body">
                            {blockIndices.map((bi) => (
                                <div key={bi}>{contentBlocks[bi]}</div>
                            ))}
                        </div>

                        {/* Footer */}
                        {renderFooter(pageIdx + 1, pages.length)}
                    </div>
                ))}
            </div>
        </>
    );
}
