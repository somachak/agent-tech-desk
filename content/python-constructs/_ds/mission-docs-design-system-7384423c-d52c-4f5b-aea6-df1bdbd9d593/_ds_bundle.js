/* @ds-bundle: {"format":4,"namespace":"MissionDocsDesignSystem_738442","components":[{"name":"Callout","sourcePath":"components/content/Callout.jsx"},{"name":"DataTable","sourcePath":"components/content/DataTable.jsx"},{"name":"Figure","sourcePath":"components/content/Figure.jsx"},{"name":"KeyValueList","sourcePath":"components/content/KeyValueList.jsx"},{"name":"Lede","sourcePath":"components/content/Lede.jsx"},{"name":"PullQuote","sourcePath":"components/content/PullQuote.jsx"},{"name":"SectionTitle","sourcePath":"components/content/SectionTitle.jsx"},{"name":"TableOfContents","sourcePath":"components/content/TableOfContents.jsx"},{"name":"Metric","sourcePath":"components/marks/Metric.jsx"},{"name":"Tag","sourcePath":"components/marks/Tag.jsx"},{"name":"TickLabel","sourcePath":"components/marks/TickLabel.jsx"},{"name":"CoverBlock","sourcePath":"components/print/CoverBlock.jsx"},{"name":"DocPage","sourcePath":"components/print/DocPage.jsx"},{"name":"PageFooter","sourcePath":"components/print/PageFooter.jsx"},{"name":"RunningHead","sourcePath":"components/print/RunningHead.jsx"},{"name":"TickMargin","sourcePath":"components/print/TickMargin.jsx"},{"name":"Button","sourcePath":"components/ui/Button.jsx"},{"name":"TextInput","sourcePath":"components/ui/TextInput.jsx"}],"sourceHashes":{"components/content/Callout.jsx":"9a7acfb1c4cb","components/content/DataTable.jsx":"18c8a3115c46","components/content/Figure.jsx":"0b59ea3389b5","components/content/KeyValueList.jsx":"b10ca9b2a300","components/content/Lede.jsx":"c8e67c0e79de","components/content/PullQuote.jsx":"46e46f2e45bb","components/content/SectionTitle.jsx":"e84ad2942d90","components/content/TableOfContents.jsx":"034afd4c9a76","components/marks/Metric.jsx":"947a2a9bd64a","components/marks/Tag.jsx":"cd785da88870","components/marks/TickLabel.jsx":"3c9ead8880c3","components/print/CoverBlock.jsx":"06c177599399","components/print/DocPage.jsx":"6d1a108d4784","components/print/PageFooter.jsx":"4fd01802bf59","components/print/RunningHead.jsx":"01ef6f13a520","components/print/TickMargin.jsx":"d185f09d5852","components/ui/Button.jsx":"faa22492062d","components/ui/TextInput.jsx":"bc463276ef49","ui_kits/docs-reader/ArticleBody.jsx":"6e99c68b22cf","ui_kits/docs-reader/LibraryScreen.jsx":"e0a2f778fa74","ui_kits/docs-reader/ReaderChrome.jsx":"53a1e5f4c0f6","ui_kits/docs-reader/content.js":"2c646da01c0c","ui_kits/pdf-document/ColophonPage.jsx":"7a22cfb0cab7","ui_kits/pdf-document/ContentsPage.jsx":"4179d90a7274","ui_kits/pdf-document/CoverPage.jsx":"0dc1d94e7a25","ui_kits/pdf-document/DataPage.jsx":"7e255695348e","ui_kits/pdf-document/PatternField.jsx":"bec32b78da5a","ui_kits/pdf-document/SectionPage.jsx":"3b281323fa4d","ui_kits/pdf-document/ViewerChrome.jsx":"212112e59c66","ui_kits/pdf-document/doc.js":"4c89d33e00c3"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MissionDocsDesignSystem_738442 = window.MissionDocsDesignSystem_738442 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/content/Callout.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  info: {
    bg: 'var(--surface-brand-soft)',
    bar: 'var(--navy-700)',
    fg: 'var(--navy-900)'
  },
  accent: {
    bg: 'var(--surface-accent-soft)',
    bar: 'var(--terra-600)',
    fg: 'var(--terra-800)'
  },
  quiet: {
    bg: 'var(--surface-sunken)',
    bar: 'var(--ink-300)',
    fg: 'var(--text-primary)'
  }
};
function Callout({
  title,
  children,
  tone = 'info',
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.info;
  return /*#__PURE__*/React.createElement("aside", _extends({}, rest, {
    style: {
      background: t.bg,
      borderTop: '2px solid ' + t.bar,
      padding: 'var(--s-5) var(--s-6)',
      margin: '0 0 var(--s-7)',
      ...style
    }
  }), title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-semibold)',
      fontSize: '11px',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: t.fg,
      marginBottom: 'var(--s-3)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-small)',
      lineHeight: 'var(--lh-body)',
      color: 'var(--text-body)',
      maxWidth: 'var(--measure-body)'
    }
  }, children));
}
Object.assign(__ds_scope, { Callout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Callout.jsx", error: String((e && e.message) || e) }); }

// components/content/DataTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function DataTable({
  columns = [],
  rows = [],
  caption,
  dense = false,
  style,
  ...rest
}) {
  const pad = dense ? 'var(--s-2) var(--s-3)' : 'var(--s-3) var(--s-4)';
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      margin: '0 0 var(--s-8)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: dense ? 'var(--fs-small)' : 'var(--fs-body)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, caption && /*#__PURE__*/React.createElement("caption", {
    style: {
      textAlign: 'left',
      captionSide: 'top',
      paddingBottom: 'var(--s-3)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-tick)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--text-accent)'
    }
  }, caption), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      textAlign: c.align || 'left',
      padding: pad,
      borderBottom: '2px solid var(--rule-strong)',
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-semibold)',
      fontSize: 'var(--fs-tick)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--text-heading)',
      whiteSpace: 'nowrap'
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: {
      textAlign: c.align || 'left',
      padding: pad,
      borderBottom: '1px solid var(--rule-hairline)',
      color: c.key === columns[0].key ? 'var(--text-primary)' : 'var(--text-body)',
      fontWeight: c.key === columns[0].key ? 'var(--fw-medium)' : 'var(--fw-regular)'
    }
  }, r[c.key])))))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/content/Figure.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Figure({
  number,
  caption,
  credit,
  ratio = '4 / 3',
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("figure", _extends({}, rest, {
    style: {
      margin: '0 0 var(--s-8)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      aspectRatio: children ? undefined : ratio,
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-card)',
      overflow: 'hidden'
    }
  }, children), (number || caption) && /*#__PURE__*/React.createElement("figcaption", {
    style: {
      display: 'flex',
      gap: 'var(--s-4)',
      marginTop: 'var(--s-3)',
      paddingTop: 'var(--s-3)',
      borderTop: '1px solid var(--rule-hairline)',
      fontSize: 'var(--fs-caption)',
      lineHeight: 'var(--lh-snug)',
      color: 'var(--text-muted)'
    }
  }, number && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      letterSpacing: 'var(--ls-tick)',
      color: 'var(--text-accent)',
      whiteSpace: 'nowrap'
    }
  }, "FIG.", number), /*#__PURE__*/React.createElement("span", {
    style: {
      maxWidth: '46ch'
    }
  }, caption, credit && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-faint)'
    }
  }, " \xB7 ", credit))));
}
Object.assign(__ds_scope, { Figure });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Figure.jsx", error: String((e && e.message) || e) }); }

// components/content/KeyValueList.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function KeyValueList({
  items = [],
  columns = 1,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("dl", _extends({}, rest, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(' + columns + ',minmax(0,1fr))',
      gap: '0 var(--s-8)',
      margin: '0 0 var(--s-8)',
      ...style
    }
  }), items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 'var(--s-5)',
      padding: 'var(--s-3) 0',
      borderBottom: '1px solid var(--rule-hairline)'
    }
  }, /*#__PURE__*/React.createElement("dt", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-tick)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, it.label), /*#__PURE__*/React.createElement("dd", {
    style: {
      margin: 0,
      fontSize: 'var(--fs-small)',
      fontWeight: 'var(--fw-medium)',
      color: 'var(--text-primary)',
      textAlign: 'right'
    }
  }, it.value))));
}
Object.assign(__ds_scope, { KeyValueList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/KeyValueList.jsx", error: String((e && e.message) || e) }); }

// components/content/Lede.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Lede({
  children,
  dropRule = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("p", _extends({}, rest, {
    style: {
      fontSize: 'var(--fs-lede)',
      lineHeight: 'var(--lh-snug)',
      color: 'var(--text-primary)',
      maxWidth: 'var(--measure-narrow)',
      margin: '0 0 var(--s-7)',
      paddingBottom: dropRule ? 'var(--s-7)' : 0,
      borderBottom: dropRule ? '1px solid var(--rule-hairline)' : 'none',
      textWrap: 'pretty',
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { Lede });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Lede.jsx", error: String((e && e.message) || e) }); }

// components/content/PullQuote.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function PullQuote({
  children,
  attribution,
  align = 'left',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("blockquote", _extends({}, rest, {
    style: {
      margin: '0 0 var(--s-8)',
      paddingTop: 'var(--s-5)',
      borderTop: '4px solid var(--rule-accent)',
      textAlign: align,
      ...style
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--fw-medium)',
      fontSize: 'var(--fs-h2)',
      lineHeight: 'var(--lh-snug)',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-heading)',
      margin: 0,
      maxWidth: 'var(--measure-narrow)',
      textWrap: 'pretty'
    }
  }, children), attribution && /*#__PURE__*/React.createElement("footer", {
    style: {
      marginTop: 'var(--s-4)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-tick)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--text-accent)'
    }
  }, attribution));
}
Object.assign(__ds_scope, { PullQuote });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/PullQuote.jsx", error: String((e && e.message) || e) }); }

// components/content/SectionTitle.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SectionTitle({
  index,
  title,
  subtitle,
  level = 2,
  rule = true,
  style,
  ...rest
}) {
  const size = level === 1 ? 'var(--fs-display)' : level === 2 ? 'var(--fs-h1)' : 'var(--fs-h2)';
  const H = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
  return /*#__PURE__*/React.createElement("header", _extends({}, rest, {
    style: {
      marginBottom: 'var(--s-7)',
      ...style
    }
  }), index && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-tick)',
      letterSpacing: 'var(--ls-tick)',
      color: 'var(--text-accent)',
      marginBottom: 'var(--s-3)'
    }
  }, index), /*#__PURE__*/React.createElement(H, {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--fw-semibold)',
      fontSize: size,
      lineHeight: 'var(--lh-heading)',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-heading)',
      margin: 0
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--s-3)',
      fontSize: 'var(--fs-body)',
      color: 'var(--text-muted)',
      maxWidth: 'var(--measure-narrow)'
    }
  }, subtitle), rule && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--s-5)',
      borderTop: '2px solid var(--rule-strong)'
    }
  }));
}
Object.assign(__ds_scope, { SectionTitle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/SectionTitle.jsx", error: String((e && e.message) || e) }); }

// components/content/TableOfContents.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TableOfContents({
  items = [],
  title = 'Contents',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({}, rest, {
    style: {
      margin: '0 0 var(--s-8)',
      ...style
    }
  }), title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-tick)',
      letterSpacing: 'var(--ls-tick)',
      textTransform: 'uppercase',
      color: 'var(--text-accent)',
      paddingBottom: 'var(--s-3)',
      borderBottom: '2px solid var(--rule-strong)',
      marginBottom: 'var(--s-2)'
    }
  }, title), items.map((it, i) => /*#__PURE__*/React.createElement("a", {
    key: i,
    href: it.href || '#',
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 'var(--s-4)',
      padding: 'var(--s-4) 0',
      borderBottom: '1px solid var(--rule-hairline)',
      textDecoration: 'none',
      borderTopWidth: 0,
      color: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-caption)',
      letterSpacing: 'var(--ls-eyebrow)',
      color: 'var(--text-accent)',
      minWidth: '2.4em'
    }
  }, it.index), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 'var(--fs-body)',
      fontWeight: 'var(--fw-medium)',
      color: 'var(--text-heading)'
    }
  }, it.title), it.note && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: 'var(--text-muted)'
    }
  }, it.note), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      flex: '0 0 auto',
      height: '1px',
      minWidth: 'var(--s-8)',
      background: 'var(--rule-mid)',
      alignSelf: 'flex-end',
      marginBottom: '4px'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-caption)',
      color: 'var(--text-muted)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, String(it.page).padStart(3, '0')))));
}
Object.assign(__ds_scope, { TableOfContents });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/TableOfContents.jsx", error: String((e && e.message) || e) }); }

// components/marks/Metric.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Metric({
  value,
  unit,
  label,
  tone = 'navy',
  align = 'left',
  style,
  ...rest
}) {
  const color = tone === 'accent' ? 'var(--terra-600)' : tone === 'ink' ? 'var(--text-primary)' : 'var(--text-heading)';
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      textAlign: align,
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--fw-semibold)',
      fontSize: 'var(--fs-h1)',
      lineHeight: 'var(--lh-heading)',
      letterSpacing: 'var(--ls-heading)',
      color,
      fontVariantNumeric: 'tabular-nums'
    }
  }, value, unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-h3)',
      fontWeight: 'var(--fw-medium)',
      marginLeft: '2px'
    }
  }, unit)), label && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--s-2)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-tick)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, label));
}
Object.assign(__ds_scope, { Metric });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/marks/Metric.jsx", error: String((e && e.message) || e) }); }

// components/marks/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  navy: {
    bg: 'var(--navy-050)',
    fg: 'var(--navy-800)',
    bd: 'var(--navy-200)'
  },
  accent: {
    bg: 'var(--terra-100)',
    fg: 'var(--terra-800)',
    bd: 'var(--terra-400)'
  },
  quiet: {
    bg: 'transparent',
    fg: 'var(--text-muted)',
    bd: 'var(--rule-mid)'
  },
  solid: {
    bg: 'var(--navy-800)',
    fg: 'var(--text-inverse)',
    bd: 'var(--navy-800)'
  }
};
function Tag({
  children,
  tone = 'navy',
  size = 'md',
  mono = false,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.navy;
  const sm = size === 'sm';
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      background: t.bg,
      color: t.fg,
      border: '1px solid ' + t.bd,
      borderRadius: 'var(--radius-1)',
      padding: sm ? '1px 5px' : '2px 7px',
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
      fontSize: sm ? 'var(--fs-tick)' : 'var(--fs-caption)',
      fontWeight: mono ? 'var(--fw-regular)' : 'var(--fw-medium)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      lineHeight: 1.6,
      whiteSpace: 'nowrap',
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/marks/Tag.jsx", error: String((e && e.message) || e) }); }

// components/marks/TickLabel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TickLabel({
  children,
  tone = 'accent',
  dash = true,
  style,
  ...rest
}) {
  const color = tone === 'accent' ? 'var(--terra-600)' : tone === 'navy' ? 'var(--navy-700)' : 'var(--text-muted)';
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-caption)',
      letterSpacing: 'var(--ls-tick)',
      textTransform: 'uppercase',
      color,
      ...style
    }
  }), dash ? '—' : '', children);
}
Object.assign(__ds_scope, { TickLabel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/marks/TickLabel.jsx", error: String((e && e.message) || e) }); }

// components/print/CoverBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function CoverBlock({
  title,
  eyebrow,
  year,
  range,
  subtitle,
  band = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      position: 'relative',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: 'var(--page-margin-top) var(--page-margin-x) var(--page-margin-bottom)',
      ...style
    }
  }), band && /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    style: {
      position: 'absolute',
      top: 0,
      left: 'var(--page-margin-x)',
      width: 'var(--rule-heavy)',
      height: '32%',
      background: 'var(--navy-800)'
    }
  }), year && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-caption)',
      letterSpacing: 'var(--ls-tick)',
      color: 'var(--text-accent)',
      marginBottom: 'var(--s-11)'
    }
  }, "\u2014", year), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--fw-bold)',
      fontSize: 'var(--fs-cover)',
      lineHeight: 'var(--lh-tight)',
      letterSpacing: 'var(--ls-cover)',
      textTransform: 'uppercase',
      color: 'var(--text-heading)',
      margin: 0
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--s-5)',
      fontSize: 'var(--fs-lede)',
      color: 'var(--text-body)',
      maxWidth: 'var(--measure-narrow)'
    }
  }, subtitle), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginTop: 'var(--s-9)',
      gap: 'var(--s-7)'
    }
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-medium)',
      fontSize: '11px',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--text-accent)',
      lineHeight: 1.5,
      maxWidth: '22ch'
    }
  }, eyebrow), range && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-caption)',
      letterSpacing: 'var(--ls-tick)',
      color: 'var(--text-accent)'
    }
  }, range)));
}
Object.assign(__ds_scope, { CoverBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/print/CoverBlock.jsx", error: String((e && e.message) || e) }); }

// components/print/DocPage.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  letter: {
    w: 'var(--page-w)',
    h: 'var(--page-h)'
  },
  a4: {
    w: 'var(--page-w-a4)',
    h: 'var(--page-h-a4)'
  }
};
function DocPage({
  size = 'letter',
  grain = true,
  bleed = false,
  head,
  footer,
  margin,
  shadow = true,
  style,
  children,
  ...rest
}) {
  const s = SIZES[size] || SIZES.letter;
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      position: 'relative',
      width: s.w,
      height: s.h,
      background: 'var(--surface-card)',
      color: 'var(--text-body)',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-body)',
      lineHeight: 'var(--lh-body)',
      boxShadow: shadow ? 'var(--shadow-sheet)' : 'none',
      overflow: 'hidden',
      flex: '0 0 auto',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: bleed ? 0 : margin || 'var(--page-margin-top) var(--page-margin-x) var(--page-margin-bottom)'
    }
  }, head, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0
    }
  }, children), footer), grain && /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 2,
      pointerEvents: 'none',
      backgroundImage: 'var(--texture-grain)',
      opacity: 'var(--grain-opacity)',
      mixBlendMode: 'multiply'
    }
  }));
}
Object.assign(__ds_scope, { DocPage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/print/DocPage.jsx", error: String((e && e.message) || e) }); }

// components/print/PageFooter.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function PageFooter({
  page,
  total,
  label,
  rule = true,
  style,
  ...rest
}) {
  const num = total ? String(page).padStart(3, '0') + '_' + String(total).padStart(3, '0') : String(page).padStart(3, '0');
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 'var(--s-5)',
      paddingTop: 'var(--s-3)',
      marginTop: 'var(--s-9)',
      borderTop: rule ? '1px solid var(--rule-hairline)' : 'none',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-tick)',
      letterSpacing: 'var(--ls-tick)',
      textTransform: 'uppercase',
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-accent)'
    }
  }, num));
}
Object.assign(__ds_scope, { PageFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/print/PageFooter.jsx", error: String((e && e.message) || e) }); }

// components/print/RunningHead.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function RunningHead({
  title,
  section,
  rule = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 'var(--s-5)',
      paddingBottom: 'var(--s-3)',
      marginBottom: 'var(--s-9)',
      borderBottom: rule ? '1px solid var(--rule-hairline)' : 'none',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-tick)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-heading)'
    }
  }, title), section && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-accent)'
    }
  }, section));
}
Object.assign(__ds_scope, { RunningHead });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/print/RunningHead.jsx", error: String((e && e.message) || e) }); }

// components/print/TickMargin.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TickMargin({
  count = 4,
  tone = 'accent',
  gap = 'var(--s-9)',
  style,
  ...rest
}) {
  const color = tone === 'accent' ? 'var(--terra-600)' : tone === 'navy' ? 'var(--navy-700)' : 'var(--ink-300)';
  return /*#__PURE__*/React.createElement("div", _extends({
    "aria-hidden": true
  }, rest, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap,
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-caption)',
      lineHeight: 1,
      color,
      ...style
    }
  }), Array.from({
    length: count
  }).map((_, i) => /*#__PURE__*/React.createElement("span", {
    key: i
  }, "\u2014")));
}
Object.assign(__ds_scope, { TickMargin });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/print/TickMargin.jsx", error: String((e && e.message) || e) }); }

// components/ui/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const V = {
  primary: {
    bg: 'var(--navy-800)',
    fg: 'var(--text-inverse)',
    bd: 'var(--navy-800)',
    hover: 'var(--navy-900)'
  },
  secondary: {
    bg: 'transparent',
    fg: 'var(--navy-800)',
    bd: 'var(--navy-300)',
    hover: 'var(--surface-brand-soft)'
  },
  accent: {
    bg: 'var(--terra-600)',
    fg: 'var(--text-inverse)',
    bd: 'var(--terra-600)',
    hover: 'var(--terra-700)'
  },
  ghost: {
    bg: 'transparent',
    fg: 'var(--text-body)',
    bd: 'transparent',
    hover: 'var(--surface-sunken)'
  }
};
function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  iconLeft,
  iconRight,
  full = false,
  style,
  ...rest
}) {
  const v = V[variant] || V.primary;
  const [h, setH] = React.useState(false);
  const [a, setA] = React.useState(false);
  const sm = size === 'sm';
  const bg = disabled ? 'var(--surface-sunken)' : h || a ? variant === 'primary' || variant === 'accent' ? v.hover : v.hover : v.bg;
  return /*#__PURE__*/React.createElement("button", _extends({}, rest, {
    disabled: disabled,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => {
      setH(false);
      setA(false);
    },
    onMouseDown: () => setA(true),
    onMouseUp: () => setA(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--s-3)',
      width: full ? '100%' : 'auto',
      padding: sm ? '5px 11px' : '8px 16px',
      background: bg,
      color: disabled ? 'var(--text-faint)' : v.fg,
      border: '1px solid ' + (disabled ? 'var(--rule-mid)' : v.bd),
      borderRadius: 'var(--radius-1)',
      fontFamily: 'var(--font-body)',
      fontSize: sm ? 'var(--fs-small)' : 'var(--fs-body)',
      fontWeight: 'var(--fw-medium)',
      letterSpacing: '0.01em',
      lineHeight: 1.5,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background var(--dur) var(--ease-out),color var(--dur) var(--ease-out),border-color var(--dur) var(--ease-out)',
      ...style
    }
  }), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ui/Button.jsx", error: String((e && e.message) || e) }); }

// components/ui/TextInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TextInput({
  label,
  hint,
  invalid = false,
  iconLeft,
  id,
  style,
  wrapperStyle,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || 'ti-' + (label || 'field').replace(/\W+/g, '-').toLowerCase();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--s-2)',
      ...wrapperStyle
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-tick)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--s-3)',
      padding: '7px 10px',
      background: 'var(--surface-card)',
      border: '1px solid ' + (invalid ? 'var(--terra-600)' : focus ? 'var(--navy-500)' : 'var(--rule-mid)'),
      borderRadius: 'var(--radius-1)',
      boxShadow: focus ? '0 0 0 2px var(--navy-050)' : 'none',
      transition: 'border-color var(--dur) var(--ease-out),box-shadow var(--dur) var(--ease-out)'
    }
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      color: 'var(--text-faint)'
    }
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId
  }, rest, {
    onFocus: e => {
      setFocus(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur && rest.onBlur(e);
    },
    style: {
      flex: 1,
      minWidth: 0,
      border: 0,
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-body)',
      color: 'var(--text-primary)',
      ...style
    }
  }))), hint && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: invalid ? 'var(--terra-700)' : 'var(--text-muted)'
    }
  }, hint));
}
Object.assign(__ds_scope, { TextInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ui/TextInput.jsx", error: String((e && e.message) || e) }); }

// ui_kits/docs-reader/ArticleBody.jsx
try { (() => {
function ArticleBody({
  section
}) {
  const {
    SectionTitle,
    Lede,
    Callout,
    Figure,
    DataTable,
    PullQuote,
    TickLabel,
    Metric
  } = window.MissionDocsDesignSystem_738442;
  return /*#__PURE__*/React.createElement("article", {
    style: {
      flex: 1,
      minWidth: 0,
      padding: 'var(--s-11) var(--s-12) var(--s-13)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 700
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 'var(--s-8)'
    }
  }, /*#__PURE__*/React.createElement(TickLabel, null, section.stamp), /*#__PURE__*/React.createElement(TickLabel, {
    dash: false,
    tone: "quiet"
  }, section.range)), /*#__PURE__*/React.createElement(SectionTitle, {
    index: section.index,
    title: section.title,
    subtitle: section.standfirst,
    level: 1
  }), /*#__PURE__*/React.createElement(Lede, {
    dropRule: true
  }, section.lede), section.body.map((b, i) => {
    if (b.t === 'p') return /*#__PURE__*/React.createElement("p", {
      key: i,
      style: {
        fontSize: 'var(--fs-lede)',
        lineHeight: 'var(--lh-body)',
        color: 'var(--text-body)',
        margin: '0 0 var(--s-6)',
        maxWidth: 'var(--measure-body)'
      }
    }, b.v);
    if (b.t === 'h') return /*#__PURE__*/React.createElement("h3", {
      key: i,
      style: {
        fontSize: 'var(--fs-h2)',
        fontWeight: 'var(--fw-semibold)',
        color: 'var(--text-heading)',
        margin: 'var(--s-9) 0 var(--s-5)'
      }
    }, b.v);
    if (b.t === 'quote') return /*#__PURE__*/React.createElement(PullQuote, {
      key: i,
      attribution: b.by
    }, b.v);
    if (b.t === 'note') return /*#__PURE__*/React.createElement(Callout, {
      key: i,
      tone: "accent",
      title: "Note"
    }, b.v);
    if (b.t === 'fig') return /*#__PURE__*/React.createElement(Figure, {
      key: i,
      number: b.n,
      caption: b.v,
      credit: b.credit,
      ratio: "16 / 9"
    });
    if (b.t === 'table') return /*#__PURE__*/React.createElement(DataTable, {
      key: i,
      caption: b.caption,
      columns: b.columns,
      rows: b.rows
    });
    if (b.t === 'metrics') return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        margin: '0 0 var(--s-8)'
      }
    }, b.items.map((m, j) => /*#__PURE__*/React.createElement("div", {
      key: m.label,
      style: {
        flex: 1,
        paddingLeft: j ? 'var(--s-5)' : 0,
        borderLeft: j ? '1px solid var(--rule-hairline)' : 'none'
      }
    }, /*#__PURE__*/React.createElement(Metric, {
      value: m.value,
      unit: m.unit,
      label: m.label,
      tone: m.tone || 'navy'
    }))));
    return null;
  })));
}
Object.assign(window, {
  ArticleBody
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/docs-reader/ArticleBody.jsx", error: String((e && e.message) || e) }); }

// ui_kits/docs-reader/LibraryScreen.jsx
try { (() => {
function LibraryScreen({
  docs,
  onOpen,
  query
}) {
  const {
    Tag,
    TickLabel,
    Button
  } = window.MissionDocsDesignSystem_738442;
  const list = docs.filter(d => !query || (d.title + ' ' + d.subtitle).toLowerCase().includes(query.toLowerCase()));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: 'var(--s-11) var(--s-12) var(--s-13)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 980
    }
  }, /*#__PURE__*/React.createElement(TickLabel, null, "2025"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--fw-bold)',
      fontSize: 'var(--fs-display)',
      letterSpacing: 'var(--ls-cover)',
      textTransform: 'uppercase',
      color: 'var(--text-heading)',
      margin: 'var(--s-4) 0 var(--s-5)'
    }
  }, "Library"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--fs-lede)',
      color: 'var(--text-body)',
      maxWidth: 'var(--measure-narrow)',
      marginBottom: 'var(--s-9)'
    }
  }, "Published documents. Each one is set from the same source as its printed edition."), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '2px solid var(--rule-strong)'
    }
  }, list.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--s-7)',
      padding: 'var(--s-6) 0',
      borderBottom: '1px solid var(--rule-hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-caption)',
      letterSpacing: 'var(--ls-tick)',
      color: 'var(--text-accent)',
      minWidth: 46
    }
  }, d.code), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 58,
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-card)',
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-body)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-primary)'
    }
  }, d.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-small)',
      color: 'var(--text-muted)'
    }
  }, d.subtitle)), /*#__PURE__*/React.createElement(Tag, {
    tone: d.state === 'Final' ? 'navy' : 'accent',
    size: "sm"
  }, d.state), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-caption)',
      color: 'var(--text-muted)',
      minWidth: 62,
      textAlign: 'right'
    }
  }, d.pages, " pp"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary",
    onClick: () => onOpen(d.id)
  }, "Read"))), !list.length && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--s-9) 0',
      fontSize: 'var(--fs-small)',
      color: 'var(--text-muted)'
    }
  }, "Nothing matches that. Published documents appear in this list."))));
}
Object.assign(window, {
  LibraryScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/docs-reader/LibraryScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/docs-reader/ReaderChrome.jsx
try { (() => {
const {
  useEffect
} = React;
function RIcon({
  name,
  size = 16
}) {
  useEffect(() => {
    window.lucide && window.lucide.createIcons();
  });
  return /*#__PURE__*/React.createElement("i", {
    "data-lucide": name,
    style: {
      width: size,
      height: size,
      strokeWidth: 1.5,
      display: 'block'
    }
  });
}
function ReaderHeader({
  view,
  onHome,
  query,
  onQuery
}) {
  const {
    Button,
    TextInput,
    Tag
  } = window.MissionDocsDesignSystem_738442;
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 5,
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--s-7)',
      height: 62,
      padding: '0 var(--s-8)',
      background: 'rgba(251,250,247,.92)',
      borderBottom: '1px solid var(--border-card)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onHome,
    style: {
      border: 0,
      background: 'none',
      padding: 0,
      cursor: 'pointer',
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--fw-semibold)',
      fontSize: 16,
      letterSpacing: '-0.012em',
      textTransform: 'uppercase',
      color: 'var(--navy-800)'
    }
  }, "Mission"), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 'var(--s-6)',
      fontSize: 'var(--fs-small)'
    }
  }, ['Library', 'Editions', 'About'].map(l => /*#__PURE__*/React.createElement("span", {
    key: l,
    style: {
      color: l === 'Library' && view === 'library' ? 'var(--navy-800)' : 'var(--text-muted)',
      fontWeight: l === 'Library' && view === 'library' ? 'var(--fw-medium)' : 'var(--fw-regular)',
      borderBottom: l === 'Library' && view === 'library' ? '1px solid var(--terra-600)' : '1px solid transparent',
      paddingBottom: 2,
      cursor: 'pointer'
    }
  }, l))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 250
    }
  }, /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "Search documents",
    value: query,
    onChange: e => onQuery(e.target.value),
    iconLeft: /*#__PURE__*/React.createElement(RIcon, {
      name: "search"
    })
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    iconLeft: /*#__PURE__*/React.createElement(RIcon, {
      name: "printer"
    })
  }, "Print"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    iconLeft: /*#__PURE__*/React.createElement(RIcon, {
      name: "download"
    })
  }, "Download PDF"));
}
function ContentsRail({
  items,
  active,
  onSelect
}) {
  const {
    Button,
    TextInput,
    Tag
  } = window.MissionDocsDesignSystem_738442;
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      width: 244,
      flex: '0 0 244px',
      borderRight: '1px solid var(--border-card)',
      padding: 'var(--s-8) var(--s-7)',
      position: 'sticky',
      top: 62,
      alignSelf: 'flex-start',
      height: 'calc(100vh - 62px)',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-tick)',
      letterSpacing: 'var(--ls-tick)',
      textTransform: 'uppercase',
      color: 'var(--text-accent)',
      paddingBottom: 'var(--s-3)',
      borderBottom: '2px solid var(--rule-strong)'
    }
  }, "Contents"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    onClick: () => onSelect(it.id),
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 'var(--s-4)',
      textAlign: 'left',
      padding: 'var(--s-4) 0',
      border: 0,
      borderBottom: '1px solid var(--rule-hairline)',
      background: 'none',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-tick)',
      letterSpacing: 'var(--ls-eyebrow)',
      color: it.id === active ? 'var(--terra-600)' : 'var(--text-faint)',
      minWidth: '2em'
    }
  }, it.index), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 'var(--fs-small)',
      fontWeight: it.id === active ? 'var(--fw-semibold)' : 'var(--fw-regular)',
      color: it.id === active ? 'var(--navy-800)' : 'var(--text-body)'
    }
  }, it.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-tick)',
      color: 'var(--text-faint)'
    }
  }, String(it.page).padStart(3, '0'))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--s-8)',
      display: 'flex',
      gap: 'var(--s-2)'
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    tone: "quiet",
    mono: true,
    size: "sm"
  }, "v2.4"), /*#__PURE__*/React.createElement(Tag, {
    tone: "accent",
    size: "sm"
  }, "Final")));
}
function DownloadPanel({
  meta
}) {
  const {
    Button,
    TextInput,
    Tag
  } = window.MissionDocsDesignSystem_738442;
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 268,
      flex: '0 0 268px',
      padding: 'var(--s-8) var(--s-7)',
      borderLeft: '1px solid var(--border-card)',
      position: 'sticky',
      top: 62,
      alignSelf: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-tick)',
      letterSpacing: 'var(--ls-tick)',
      textTransform: 'uppercase',
      color: 'var(--text-accent)',
      marginBottom: 'var(--s-4)'
    }
  }, "This document"), /*#__PURE__*/React.createElement(KeyValueList, {
    items: meta
  }), /*#__PURE__*/React.createElement(Button, {
    full: true,
    iconLeft: /*#__PURE__*/React.createElement(RIcon, {
      name: "download"
    }),
    style: {
      marginBottom: 'var(--s-3)'
    }
  }, "Download PDF \xB7 4.2 MB"), /*#__PURE__*/React.createElement(Button, {
    full: true,
    variant: "secondary",
    iconLeft: /*#__PURE__*/React.createElement(RIcon, {
      name: "link"
    })
  }, "Copy link"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--s-5)',
      fontSize: 'var(--fs-caption)',
      color: 'var(--text-muted)',
      maxWidth: 'none'
    }
  }, "Set from the same source as the printed edition. Page numbers match."));
}
Object.assign(window, {
  RIcon,
  ReaderHeader,
  ContentsRail,
  DownloadPanel
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/docs-reader/ReaderChrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/docs-reader/content.js
try { (() => {
window.READER = {
  docs: [{
    id: 'portfolio',
    code: '001',
    title: 'Portfólio — trabalhos selecionados',
    subtitle: 'Selected works, 2020—2025',
    state: 'Final',
    pages: 44
  }, {
    id: 'survey',
    code: '002',
    title: 'Measured survey, Rua da Boavista',
    subtitle: 'Hand and scan, five floors',
    state: 'Final',
    pages: 28
  }, {
    id: 'brief',
    code: '003',
    title: 'Brief — retail conversion',
    subtitle: 'Scope, constraints, programme',
    state: 'Draft',
    pages: 12
  }],
  toc: [{
    id: 'brief',
    index: '01',
    title: 'Brief',
    page: 4
  }, {
    id: 'method',
    index: '02',
    title: 'Method',
    page: 12
  }, {
    id: 'findings',
    index: '03',
    title: 'Findings',
    page: 24
  }, {
    id: 'plates',
    index: '04',
    title: 'Plates',
    page: 31
  }, {
    id: 'colophon',
    index: '—',
    title: 'Colophon',
    page: 44
  }],
  meta: [{
    label: 'Edition',
    value: 'Second'
  }, {
    label: 'Year',
    value: '2025'
  }, {
    label: 'Pages',
    value: '44'
  }, {
    label: 'Format',
    value: '240 × 240 mm'
  }],
  sections: {
    brief: {
      index: '01',
      title: 'Brief',
      stamp: '2025',
      range: '004_044',
      standfirst: 'Scope, constraints and what the document has to prove.',
      lede: 'A retail floor and four floors above it, to be surveyed and drawn before any design work begins.',
      body: [{
        t: 'p',
        v: 'The client asked for a record, not a proposal. Everything in this volume is measured or counted; nothing is projected. Where a figure could not be verified twice it is marked and left out of the totals.'
      }, {
        t: 'note',
        v: 'Figures are self-reported and unaudited.'
      }, {
        t: 'h',
        v: 'Constraints'
      }, {
        t: 'p',
        v: 'Access was limited to weekdays outside trading hours, which set the six-visit schedule. The plant floor was not entered.'
      }, {
        t: 'fig',
        n: '01',
        v: 'Street elevation, as found',
        credit: 'Hand survey'
      }]
    },
    method: {
      index: '02',
      title: 'Method',
      stamp: '2025',
      range: '012_044',
      standfirst: 'How the survey was run.',
      lede: 'The building was measured twice: once by hand over four days, once by scan. Where the two disagreed, the hand measure was kept.',
      body: [{
        t: 'p',
        v: 'Every floor was drawn at 1:50 before any figure was recorded, so that dimensions could be checked against the drawing rather than against a previous reading. Discrepancies above 20 mm were re-measured on a second visit.'
      }, {
        t: 'quote',
        v: 'The drawing came first; the numbers only had to agree with it.',
        by: 'Survey notes, day one'
      }, {
        t: 'h',
        v: 'Counting occupancy'
      }, {
        t: 'p',
        v: 'Occupancy was counted on six weekdays between 09:00 and 19:00 at twenty-minute intervals, from fixed positions marked on the plan rather than from circulation. That keeps the figures comparable across floors.'
      }, {
        t: 'fig',
        n: '03',
        v: 'Third floor, measured plan',
        credit: 'Hand survey'
      }]
    },
    findings: {
      index: '03',
      title: 'Findings',
      stamp: '2025',
      range: '024_044',
      standfirst: 'Measured results, floor by floor.',
      lede: 'Peak occupancy never reached the design figure on any floor. The studio floor is the least densely used and the retail floor the most.',
      body: [{
        t: 'metrics',
        items: [{
          value: '44',
          label: 'Plates'
        }, {
          value: '18',
          unit: 'mo',
          label: 'Duration',
          tone: 'accent'
        }, {
          value: '1,240',
          unit: 'm²',
          label: 'Surveyed'
        }, {
          value: '6',
          label: 'Visits'
        }]
      }, {
        t: 'table',
        caption: 'Table 02 — Programme by floor',
        columns: [{
          key: 'floor',
          label: 'Floor'
        }, {
          key: 'use',
          label: 'Use'
        }, {
          key: 'area',
          label: 'm²',
          align: 'right'
        }, {
          key: 'occ',
          label: 'Peak occ.',
          align: 'right'
        }, {
          key: 'ratio',
          label: 'm²/person',
          align: 'right'
        }],
        rows: [{
          floor: '01',
          use: 'Retail',
          area: '420',
          occ: '38',
          ratio: '11.1'
        }, {
          floor: '02',
          use: 'Studio',
          area: '380',
          occ: '26',
          ratio: '14.6'
        }, {
          floor: '03',
          use: 'Office',
          area: '365',
          occ: '31',
          ratio: '11.8'
        }, {
          floor: '04',
          use: 'Office',
          area: '365',
          occ: '29',
          ratio: '12.6'
        }, {
          floor: '05',
          use: 'Plant',
          area: '75',
          occ: '—',
          ratio: '—'
        }]
      }, {
        t: 'p',
        v: 'Peak is the highest single reading, not a mean. The plant floor was not entered and is excluded from the occupancy totals.'
      }]
    },
    plates: {
      index: '04',
      title: 'Plates',
      stamp: '2025',
      range: '031_044',
      standfirst: 'The drawing set, at plate size.',
      lede: 'Thirteen plates, printed one to a page at 1:100. Plate numbers follow the survey order, not the floor order.',
      body: [{
        t: 'fig',
        n: '07',
        v: 'Ground floor, as found',
        credit: '1:100'
      }, {
        t: 'p',
        v: 'Plates are reproduced without annotation. Dimensions are carried in the tables rather than on the drawings, which keeps the linework readable at print size.'
      }, {
        t: 'fig',
        n: '08',
        v: 'Section AA, looking east',
        credit: '1:100'
      }]
    },
    colophon: {
      index: '—',
      title: 'Colophon',
      stamp: '2025',
      range: '044_044',
      standfirst: 'How this was made.',
      lede: 'Set in General Sans and JetBrains Mono. Printed in Porto on Munken Pure Rough 120 g.',
      body: [{
        t: 'p',
        v: 'Four hundred copies, Otabind with an exposed spine. The digital edition is generated from the same source, so page numbers match the print.'
      }]
    }
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/docs-reader/content.js", error: String((e && e.message) || e) }); }

// ui_kits/pdf-document/ColophonPage.jsx
try { (() => {
function ColophonPage({
  doc
}) {
  const {
    DocPage,
    PageFooter,
    KeyValueList,
    TickLabel
  } = window.MissionDocsDesignSystem_738442;
  return /*#__PURE__*/React.createElement(DocPage, {
    shadow: false,
    footer: /*#__PURE__*/React.createElement(PageFooter, {
      page: doc.pages,
      total: doc.pages,
      label: doc.client
    })
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '10px solid var(--navy-800)',
      width: 120,
      marginBottom: 'var(--s-9)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--fw-semibold)',
      fontSize: 'var(--fs-h1)',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-heading)',
      marginBottom: 'var(--s-7)'
    }
  }, "Colophon"), /*#__PURE__*/React.createElement(KeyValueList, {
    items: doc.colophon
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--s-8)',
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(TickLabel, null, doc.year), /*#__PURE__*/React.createElement(TickLabel, {
    dash: false,
    tone: "quiet"
  }, doc.range))));
}
Object.assign(window, {
  ColophonPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdf-document/ColophonPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pdf-document/ContentsPage.jsx
try { (() => {
function ContentsPage({
  doc
}) {
  const {
    DocPage,
    RunningHead,
    PageFooter,
    SectionTitle,
    TableOfContents,
    KeyValueList
  } = window.MissionDocsDesignSystem_738442;
  return /*#__PURE__*/React.createElement(DocPage, {
    shadow: false,
    head: /*#__PURE__*/React.createElement(RunningHead, {
      title: doc.title,
      section: "Contents"
    }),
    footer: /*#__PURE__*/React.createElement(PageFooter, {
      page: 2,
      total: doc.pages,
      label: doc.client
    })
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    index: "\u2014",
    title: "Contents",
    level: 2
  }), /*#__PURE__*/React.createElement(TableOfContents, {
    title: null,
    items: doc.toc
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--s-11)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-tick)',
      letterSpacing: 'var(--ls-tick)',
      textTransform: 'uppercase',
      color: 'var(--text-accent)',
      marginBottom: 'var(--s-4)'
    }
  }, "Document"), /*#__PURE__*/React.createElement(KeyValueList, {
    columns: 2,
    items: doc.meta
  })));
}
Object.assign(window, {
  ContentsPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdf-document/ContentsPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pdf-document/CoverPage.jsx
try { (() => {
function CoverPage({
  doc
}) {
  const {
    DocPage,
    CoverBlock,
    TickMargin
  } = window.MissionDocsDesignSystem_738442;
  return /*#__PURE__*/React.createElement(DocPage, {
    bleed: true,
    shadow: false
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: '46%',
      height: '62%'
    }
  }, /*#__PURE__*/React.createElement(PatternField, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 'var(--page-margin-x)',
      width: 'var(--rule-heavy)',
      height: '30%',
      background: 'var(--navy-800)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '46%',
      right: 'var(--page-margin-x)'
    }
  }, /*#__PURE__*/React.createElement(TickMargin, {
    count: 3,
    gap: "var(--s-7)"
  }))), /*#__PURE__*/React.createElement(CoverBlock, {
    band: false,
    year: doc.year,
    title: doc.title,
    subtitle: doc.subtitle,
    eyebrow: doc.eyebrow,
    range: doc.range
  }));
}
Object.assign(window, {
  CoverPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdf-document/CoverPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pdf-document/DataPage.jsx
try { (() => {
function DataPage({
  doc,
  page
}) {
  const {
    DocPage,
    RunningHead,
    PageFooter,
    SectionTitle,
    DataTable,
    Metric,
    Callout
  } = window.MissionDocsDesignSystem_738442;
  return /*#__PURE__*/React.createElement(DocPage, {
    shadow: false,
    head: /*#__PURE__*/React.createElement(RunningHead, {
      title: doc.title,
      section: page.section
    }),
    footer: /*#__PURE__*/React.createElement(PageFooter, {
      page: page.number,
      total: doc.pages,
      label: doc.client
    })
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    index: page.index,
    title: page.title
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      marginBottom: 'var(--s-9)'
    }
  }, page.metrics.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: m.label,
    style: {
      flex: 1,
      paddingLeft: i ? 'var(--s-5)' : 0,
      borderLeft: i ? '1px solid var(--rule-hairline)' : 'none'
    }
  }, /*#__PURE__*/React.createElement(Metric, {
    value: m.value,
    unit: m.unit,
    label: m.label,
    tone: m.tone || 'navy'
  })))), /*#__PURE__*/React.createElement(DataTable, {
    caption: page.tableCaption,
    columns: page.columns,
    rows: page.rows
  }), /*#__PURE__*/React.createElement(Callout, {
    tone: "quiet",
    title: "Method"
  }, page.method));
}
Object.assign(window, {
  DataPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdf-document/DataPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pdf-document/PatternField.jsx
try { (() => {
const {
  useMemo
} = React;

// The reference cover's terracotta line-pattern: repeating hairline diagonals with
// navy blocks punched in. A field, never a background for body copy.
function PatternField({
  blocks = 26,
  style
}) {
  const punches = useMemo(() => Array.from({
    length: blocks
  }).map((_, i) => ({
    top: 4 + i * 37 % 88 + i % 3 * 1.5,
    left: 6 + i * 53 % 84,
    w: 14 + i % 3 * 6,
    h: 5 + i % 2 * 2
  })), [blocks]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: 'repeating-linear-gradient(58deg, var(--terra-600) 0 1px, transparent 1px 13px), repeating-linear-gradient(-58deg, var(--terra-600) 0 1px, transparent 1px 13px)',
      opacity: .85
    }
  }), punches.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: 'absolute',
      top: p.top + '%',
      left: p.left + '%',
      width: p.w + 'px',
      height: p.h + 'px',
      background: 'var(--navy-800)'
    }
  })));
}
Object.assign(window, {
  PatternField
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdf-document/PatternField.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pdf-document/SectionPage.jsx
try { (() => {
function SectionPage({
  doc,
  page
}) {
  const {
    DocPage,
    RunningHead,
    PageFooter,
    SectionTitle,
    Lede,
    Callout,
    Figure,
    PullQuote,
    TickMargin,
    Tag
  } = window.MissionDocsDesignSystem_738442;
  return /*#__PURE__*/React.createElement(DocPage, {
    shadow: false,
    head: /*#__PURE__*/React.createElement(RunningHead, {
      title: doc.title,
      section: page.section
    }),
    footer: /*#__PURE__*/React.createElement(PageFooter, {
      page: page.number,
      total: doc.pages,
      label: doc.client
    })
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 26,
      top: 300
    }
  }, /*#__PURE__*/React.createElement(TickMargin, {
    count: 4
  })), /*#__PURE__*/React.createElement(SectionTitle, {
    index: page.index,
    title: page.title,
    subtitle: page.standfirst
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.35fr 1fr',
      gap: 'var(--s-8)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Lede, null, page.lede), page.body.map((p, i) => /*#__PURE__*/React.createElement("p", {
    key: i,
    style: {
      fontSize: 'var(--fs-body)',
      lineHeight: 'var(--lh-body)',
      color: 'var(--text-body)',
      margin: '0 0 var(--s-5)'
    }
  }, p)), /*#__PURE__*/React.createElement(PullQuote, {
    attribution: page.quoteBy
  }, page.quote)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Figure, {
    number: page.figNumber,
    caption: page.figCaption,
    credit: page.figCredit,
    ratio: "3 / 4"
  }), /*#__PURE__*/React.createElement(Callout, {
    tone: "accent",
    title: "Note"
  }, page.note), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--s-2)'
    }
  }, page.tags.map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t,
    tone: "quiet",
    size: "sm"
  }, t))))));
}
Object.assign(window, {
  SectionPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdf-document/SectionPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pdf-document/ViewerChrome.jsx
try { (() => {
const {
  useEffect
} = React;
function Icon({
  name,
  size = 16
}) {
  useEffect(() => {
    window.lucide && window.lucide.createIcons();
  });
  return /*#__PURE__*/React.createElement("i", {
    "data-lucide": name,
    style: {
      width: size,
      height: size,
      strokeWidth: 1.5,
      display: 'block'
    }
  });
}
function ViewerHeader({
  doc,
  query,
  onQuery
}) {
  const {
    Button,
    TextInput,
    Tag
  } = window.MissionDocsDesignSystem_738442;
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 5,
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--s-7)',
      padding: '0 var(--s-7)',
      height: 58,
      background: 'rgba(251,250,247,.92)',
      borderBottom: '1px solid var(--border-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--fw-semibold)',
      fontSize: 15,
      letterSpacing: '-0.012em',
      textTransform: 'uppercase',
      color: 'var(--navy-800)'
    }
  }, "Mission"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 22,
      background: 'var(--rule-hairline)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 'var(--s-4)',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-small)',
      fontWeight: 'var(--fw-medium)',
      color: 'var(--text-primary)',
      whiteSpace: 'nowrap'
    }
  }, doc.title, " \u2014 ", doc.subtitle), /*#__PURE__*/React.createElement(Tag, {
    tone: "quiet",
    mono: true,
    size: "sm"
  }, doc.version)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 232
    }
  }, /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "Search this document",
    value: query,
    onChange: e => onQuery(e.target.value),
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "search"
    })
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "link"
    })
  }, "Copy link"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "download"
    })
  }, "Download PDF"));
}
function PageRail({
  pages,
  active,
  onSelect
}) {
  const {
    Button,
    TextInput,
    Tag
  } = window.MissionDocsDesignSystem_738442;
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      width: 148,
      flex: '0 0 148px',
      borderRight: '1px solid var(--border-card)',
      background: 'var(--surface-sunken)',
      padding: 'var(--s-5) var(--s-4)',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-tick)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginBottom: 'var(--s-4)'
    }
  }, "Pages"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--s-4)'
    }
  }, pages.map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => onSelect(i),
    style: {
      padding: 0,
      border: 0,
      background: 'none',
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 152,
      width: 118,
      background: 'var(--surface-card)',
      border: '1px solid ' + (i === active ? 'var(--navy-700)' : 'var(--border-card)'),
      outline: i === active ? '1px solid var(--navy-700)' : 'none',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      transform: 'scale(.1446)',
      transformOrigin: 'top left',
      pointerEvents: 'none'
    }
  }, p.render())), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 5,
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-tick)',
      letterSpacing: 'var(--ls-eyebrow)',
      textTransform: 'uppercase',
      color: i === active ? 'var(--text-accent)' : 'var(--text-muted)'
    }
  }, String(i + 1).padStart(3, '0'), " ", p.label)))));
}
function ViewerFooter({
  index,
  total,
  onPrev,
  onNext,
  zoom,
  onZoom
}) {
  const {
    Button,
    TextInput,
    Tag
  } = window.MissionDocsDesignSystem_738442;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--s-5)',
      padding: '0 var(--s-7)',
      height: 46,
      borderTop: '1px solid var(--border-card)',
      background: 'var(--surface-card)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: onPrev,
    disabled: index === 0,
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-left"
    })
  }, "Prev"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-caption)',
      letterSpacing: 'var(--ls-tick)',
      color: 'var(--text-accent)'
    }
  }, String(index + 1).padStart(3, '0'), "_", String(total).padStart(3, '0')), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: onNext,
    disabled: index === total - 1,
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right"
    })
  }, "Next"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), [0.6, 0.8, 1].map(z => /*#__PURE__*/React.createElement("button", {
    key: z,
    onClick: () => onZoom(z),
    style: {
      border: '1px solid ' + (zoom === z ? 'var(--navy-700)' : 'var(--rule-mid)'),
      background: zoom === z ? 'var(--surface-brand-soft)' : 'transparent',
      color: zoom === z ? 'var(--navy-800)' : 'var(--text-muted)',
      borderRadius: 'var(--radius-1)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-tick)',
      letterSpacing: '.08em',
      padding: '4px 8px',
      cursor: 'pointer'
    }
  }, Math.round(z * 100), "%")));
}
Object.assign(window, {
  Icon,
  ViewerHeader,
  PageRail,
  ViewerFooter
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdf-document/ViewerChrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pdf-document/doc.js
try { (() => {
window.MISSION_DOC = {
  title: 'Portfólio',
  subtitle: 'Selected works, 2020—2025',
  eyebrow: 'trabalhos selecionados',
  year: 2025,
  range: '001_044',
  pages: 44,
  client: 'Mission',
  version: 'v2.4',
  toc: [{
    index: '01',
    title: 'Brief',
    page: 4,
    note: 'Scope and constraints'
  }, {
    index: '02',
    title: 'Method',
    page: 12,
    note: 'Survey and drawing set'
  }, {
    index: '03',
    title: 'Findings',
    page: 24,
    note: 'Measured results'
  }, {
    index: '04',
    title: 'Plates',
    page: 31
  }, {
    index: '—',
    title: 'Colophon',
    page: 44
  }],
  meta: [{
    label: 'Client',
    value: 'Mission'
  }, {
    label: 'Edition',
    value: 'Second'
  }, {
    label: 'Year',
    value: '2025'
  }, {
    label: 'Plates',
    value: '44'
  }, {
    label: 'Format',
    value: '240 × 240 mm'
  }, {
    label: 'Status',
    value: 'Final'
  }],
  section: {
    number: 12,
    index: '02',
    section: '02 Method',
    title: 'Method',
    standfirst: 'How the survey was run.',
    lede: 'The building was measured twice: once by hand over four days, once by scan. Where the two disagreed, the hand measure was kept.',
    body: ['Every floor was drawn at 1:50 before any figure was recorded, so that dimensions could be checked against the drawing rather than against a previous reading. Discrepancies above 20 mm were re-measured on a second visit.', 'Occupancy was counted on six weekdays between 09:00 and 19:00 at twenty-minute intervals. Counts were taken from fixed positions marked on the plan, not from circulation, which keeps the figures comparable across floors.'],
    quote: 'The drawing came first; the numbers only had to agree with it.',
    quoteBy: 'Survey notes, day one',
    figNumber: '03',
    figCaption: 'Third floor, measured plan',
    figCredit: 'Hand survey',
    note: 'Figures are self-reported and unaudited.',
    tags: ['Survey', 'Plans', '1:50']
  },
  data: {
    number: 24,
    index: '03',
    section: '03 Findings',
    title: 'Findings',
    metrics: [{
      value: '44',
      label: 'Plates'
    }, {
      value: '18',
      unit: 'mo',
      label: 'Duration',
      tone: 'accent'
    }, {
      value: '1,240',
      unit: 'm²',
      label: 'Surveyed'
    }, {
      value: '6',
      label: 'Visits'
    }],
    tableCaption: 'Table 02 — Programme by floor',
    columns: [{
      key: 'floor',
      label: 'Floor'
    }, {
      key: 'use',
      label: 'Use'
    }, {
      key: 'area',
      label: 'm²',
      align: 'right'
    }, {
      key: 'occ',
      label: 'Peak occ.',
      align: 'right'
    }, {
      key: 'ratio',
      label: 'm²/person',
      align: 'right'
    }],
    rows: [{
      floor: '01',
      use: 'Retail',
      area: '420',
      occ: '38',
      ratio: '11.1'
    }, {
      floor: '02',
      use: 'Studio',
      area: '380',
      occ: '26',
      ratio: '14.6'
    }, {
      floor: '03',
      use: 'Office',
      area: '365',
      occ: '31',
      ratio: '11.8'
    }, {
      floor: '04',
      use: 'Office',
      area: '365',
      occ: '29',
      ratio: '12.6'
    }, {
      floor: '05',
      use: 'Plant',
      area: '75',
      occ: '—',
      ratio: '—'
    }],
    method: 'Counts taken at twenty-minute intervals from fixed positions marked on the plan. Peak is the highest single reading, not a mean.'
  },
  colophon: [{
    label: 'Set in',
    value: 'General Sans & JetBrains Mono'
  }, {
    label: 'Paper',
    value: 'Munken Pure Rough 120 g'
  }, {
    label: 'Printed by',
    value: 'Gráfica Central, Porto'
  }, {
    label: 'Binding',
    value: 'Otabind, exposed spine'
  }, {
    label: 'Edition',
    value: '400 copies'
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pdf-document/doc.js", error: String((e && e.message) || e) }); }

__ds_ns.Callout = __ds_scope.Callout;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.Figure = __ds_scope.Figure;

__ds_ns.KeyValueList = __ds_scope.KeyValueList;

__ds_ns.Lede = __ds_scope.Lede;

__ds_ns.PullQuote = __ds_scope.PullQuote;

__ds_ns.SectionTitle = __ds_scope.SectionTitle;

__ds_ns.TableOfContents = __ds_scope.TableOfContents;

__ds_ns.Metric = __ds_scope.Metric;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.TickLabel = __ds_scope.TickLabel;

__ds_ns.CoverBlock = __ds_scope.CoverBlock;

__ds_ns.DocPage = __ds_scope.DocPage;

__ds_ns.PageFooter = __ds_scope.PageFooter;

__ds_ns.RunningHead = __ds_scope.RunningHead;

__ds_ns.TickMargin = __ds_scope.TickMargin;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.TextInput = __ds_scope.TextInput;

})();
