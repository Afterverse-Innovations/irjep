import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import type { JournalTemplateConfig } from "@/lib/template-config";
import type { StructuredPaperData } from "@/lib/paper-data";
import { useTemplateStyles } from "./useTemplateStyles";

// ─── Page size lookup (mm → px at 96dpi) ─────────────────────
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
 * Professional paginated renderer — renders content once to measure,
 * then creates separate page divs each showing a vertical "slice"
 * of the content. Each page has its own header, footer & page number.
 */
export function TemplateRenderer({ config, data, className = "" }: TemplateRendererProps) {
    const css = useTemplateStyles(config);
    const measureBodyRef = useRef<HTMLDivElement>(null);
    const measureHeaderRef = useRef<HTMLDivElement>(null);
    const measureFooterRef = useRef<HTMLDivElement>(null);
    const measureTitleRef = useRef<HTMLDivElement>(null);

    const [pageCount, setPageCount] = useState(1);
    // Content height available for BODY on page 1 (less due to title)
    const [page1BodyHeight, setPage1BodyHeight] = useState(0);
    // Content height available for BODY on page 2+ (full)
    const [laterBodyHeight, setLaterBodyHeight] = useState(0);
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

    // ─── Compute page dimensions (px) ────────────────────────
    const pageDims = useMemo(() => {
        const ps = PAGE_SIZES[config.page.size] ?? PAGE_SIZES.A4;
        const isLandscape = config.page.orientation === "landscape";
        return {
            widthMm: isLandscape ? ps.height : ps.width,
            heightMm: isLandscape ? ps.width : ps.height,
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

    // ─── Measure content and compute pages ───────────────────
    useEffect(() => {
        const bodyEl = measureBodyRef.current;
        const headerEl = measureHeaderRef.current;
        const footerEl = measureFooterRef.current;
        const titleEl = measureTitleRef.current;
        if (!bodyEl || !headerEl || !footerEl || !titleEl) return;

        const timer = setTimeout(() => {
            const headerH = headerEl.getBoundingClientRect().height;
            const footerH = footerEl.getBoundingClientRect().height;
            const titleH = titleEl.getBoundingClientRect().height;

            // Full area between margins (excluding margins, which are padding on .paper-page)
            const totalInnerH = pageDims.heightPx - pageDims.marginTopPx - pageDims.marginBottomPx;

            // Page 1: header + title + body + footer
            const p1Body = totalInnerH - headerH - titleH - footerH;
            // Page 2+: header + body + footer (no title)
            const pNBody = totalInnerH - headerH - footerH;

            // Total rendered body height (with columns applied)
            const totalBodyH = bodyEl.scrollHeight;

            let pages = 1;
            if (totalBodyH > p1Body) {
                // Remaining body after page 1
                const remaining = totalBodyH - p1Body;
                pages = 1 + Math.ceil(remaining / pNBody);
            }

            setPage1BodyHeight(p1Body);
            setLaterBodyHeight(pNBody);
            setPageCount(pages);
            setMeasured(true);
        }, 120);

        return () => clearTimeout(timer);
    }, [data, config, pageDims, numberedTables, numberedRefs, endMatter]);

    // ─── Body content JSX (reused for measurement + each page) ─
    const bodyContent = useMemo(() => (
        <>
            {/* Abstract */}
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

            {/* Empty state */}
            {data.body.length === 0 && !data.abstract && (
                <div style={{ color: "#999", fontStyle: "italic", padding: "4mm 0" }}>
                    [No content sections added yet. Use the editor to add sections, paragraphs, and tables.]
                </div>
            )}

            {/* Body sections */}
            {data.body.map((section, i) => (
                <div key={i} className="paper-section">
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
            ))}

            {/* Tables */}
            {numberedTables.map((tbl) => (
                <div key={tbl.number} className="paper-table-block">
                    <div className="paper-table-caption">
                        {config.numbering.tablePrefix} {tbl.number}. {tbl.caption}
                    </div>
                    <table className="paper-table">
                        {tbl.headers.length > 0 && (
                            <thead>
                                <tr>
                                    {tbl.headers.map((h, hi) => <th key={hi}>{h}</th>)}
                                </tr>
                            </thead>
                        )}
                        <tbody>
                            {tbl.rows.map((row, ri) => (
                                <tr key={ri}>
                                    {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {tbl.notes && (
                        <div style={{ fontSize: "8pt", fontStyle: "italic", marginTop: "1mm" }}>{tbl.notes}</div>
                    )}
                </div>
            ))}

            {/* References */}
            {numberedRefs.length > 0 && (
                <div className="paper-references">
                    <div className="paper-references-heading">References</div>
                    {numberedRefs.map((ref) => (
                        <div key={ref.number} className="paper-reference-item">
                            [{ref.number}] {ref.text}
                        </div>
                    ))}
                </div>
            )}

            {/* End Matter */}
            {endMatter && (
                <div className="paper-endmatter">
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
                                • Was Ethics Committee Approval obtained for this study?{" "}
                                {endMatter.authorDeclaration.ethicsApproval}
                            </div>
                        )}
                        {endMatter.authorDeclaration.informedConsent && (
                            <div className="paper-endmatter-item">
                                • Was informed consent obtained from the subjects involved in the study?{" "}
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
                            {endMatter.plagiarismChecking.imageConsent && (
                                <div className="paper-endmatter-item">
                                    • For any images presented appropriate consent has been obtained.{" "}
                                    {endMatter.plagiarismChecking.imageConsent}
                                </div>
                            )}
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
            )}
        </>
    ), [data, config, numberedTables, numberedRefs, endMatter]);

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

    // ─── Title block (shown only on first page, outside columns) ─
    const titleBlock = (
        <>
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
        </>
    );

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            {/* ─── Hidden Measurement Container ─────────────── */}
            {/* Renders at full page width WITH column layout to get
                accurate total content height. */}
            <div
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
                <div ref={measureHeaderRef}>
                    {renderHeader(1)}
                </div>
                <div ref={measureTitleRef}>
                    {titleBlock}
                </div>
                <div className="paper-body" ref={measureBodyRef}>
                    {bodyContent}
                </div>
                <div ref={measureFooterRef}>
                    {renderFooter(1, 1)}
                </div>
            </div>

            {/* ─── Rendered Pages ───────────────────────────── */}
            <div className="paper-paged-wrapper">
                {Array.from({ length: pageCount }, (_, pageIdx) => (
                    <div key={pageIdx} className={`paper-page ${className}`}>
                        {/* Header */}
                        {renderHeader(pageIdx + 1)}

                        {/* Title block only on page 1 */}
                        {pageIdx === 0 && titleBlock}

                        {/* Content slice — negative margin scrolls to this page's offset */}
                        <div className="paper-page-content">
                            <div
                                className="paper-page-clip"
                                style={{
                                    marginTop: pageIdx === 0
                                        ? 0
                                        : -(page1BodyHeight + (pageIdx - 1) * laterBodyHeight),
                                }}
                            >
                                <div className="paper-body">
                                    {bodyContent}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        {renderFooter(pageIdx + 1, pageCount)}
                    </div>
                ))}
            </div>
        </>
    );
}
