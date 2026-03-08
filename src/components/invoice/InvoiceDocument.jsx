import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { formatCurrency } from '../../utils/invoiceHelpers';

// Use built-in Helvetica font family (always available in react-pdf, no CDN needed)
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    paddingTop: 48,
    paddingBottom: 80, // room for absolute footer
    paddingHorizontal: 48,
    fontSize: 10,
    color: '#1a1a1a',
    fontFamily: 'Helvetica',
  },

  /* ── HEADER ─────────────────── */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  brandName: {
    fontSize: 34,
    fontFamily: 'Helvetica-Bold',
    color: '#C9A96E',
    letterSpacing: 8,
  },
  brandTagline: {
    fontSize: 8,
    color: '#999999',
    marginTop: 4,
    letterSpacing: 2,
  },
  invoiceLabel: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    textAlign: 'right',
  },
  invoiceNumber: {
    fontSize: 10,
    color: '#C9A96E',
    textAlign: 'right',
    marginTop: 5,
    fontFamily: 'Helvetica',
  },
  paidBadge: {
    marginTop: 8,
    backgroundColor: '#C9A96E',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 3,
    alignSelf: 'flex-end',
  },
  paidBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
  },

  /* ── GOLD DIVIDER ────────────── */
  divider: {
    height: 1,
    backgroundColor: '#C9A96E',
    marginVertical: 24,
    opacity: 0.5,
  },

  /* ── BILL TO / INVOICE INFO ──── */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 36,
  },
  infoBlock: { flex: 1 },
  infoLabel: {
    fontSize: 7.5,
    color: '#999999',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  infoText: {
    fontSize: 9.5,
    color: '#2d2d2d',
    lineHeight: 1.7,
  },

  /* ── ITEMS TABLE ─────────────── */
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 0,
  },
  tableHeaderText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#C9A96E',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  itemNameText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    color: '#1a1a1a',
  },
  itemDescText: {
    fontSize: 8,
    color: '#888888',
    marginTop: 2,
  },

  /* Column widths */
  colItem: { flex: 3 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1.5, textAlign: 'right' },
  colTotal: { flex: 1.5, textAlign: 'right' },

  /* ── TOTALS ──────────────────── */
  totalsSection: {
    marginTop: 28,
    alignItems: 'flex-end',
  },
  totalsTable: { width: 260 },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalsLabel: { fontSize: 9.5, color: '#555555' },
  totalsValue: { fontSize: 9.5, color: '#1a1a1a' },
  discountValue: { fontSize: 9.5, color: '#22c55e' },
  freeShipValue: { fontSize: 9.5, color: '#22c55e' },
  totalDivider: {
    height: 1,
    backgroundColor: '#C9A96E',
    marginVertical: 8,
    opacity: 0.6,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },
  grandTotalValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#C9A96E',
  },

  /* ── FOOTER ──────────────────── */
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 48,
    right: 48,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#C9A96E',
    marginBottom: 14,
    opacity: 0.3,
  },
  thankYou: {
    fontSize: 10,
    color: '#C9A96E',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 2.5,
    fontFamily: 'Helvetica-Bold',
  },
  footerText: {
    fontSize: 7.5,
    color: '#aaaaaa',
    textAlign: 'center',
    lineHeight: 1.9,
  },
});

export default function InvoiceDocument({ data }) {
  const { company, invoice, customer, items, totals } = data;

  return (
    <Document title={`AURUM Invoice ${invoice.number}`} author="AURUM Luxury Jewelry">
      <Page size="A4" style={styles.page}>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>{company.name}</Text>
            <Text style={styles.brandTagline}>{company.tagline.toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.number}</Text>
            <View style={styles.paidBadge}>
              <Text style={styles.paidBadgeText}>PAID</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── BILL TO + INVOICE INFO ── */}
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Bill To</Text>
            <Text style={styles.infoText}>{customer.name}</Text>
            <Text style={styles.infoText}>{customer.email}</Text>
            {customer.phone ? <Text style={styles.infoText}>{customer.phone}</Text> : null}
            {customer.address ? <Text style={styles.infoText}>{customer.address}</Text> : null}
          </View>

          <View style={[styles.infoBlock, { alignItems: 'flex-end' }]}>
            <Text style={styles.infoLabel}>Invoice Details</Text>
            <Text style={styles.infoText}>Invoice No: {invoice.number}</Text>
            <Text style={styles.infoText}>Order ID: {invoice.orderId}</Text>
            <Text style={styles.infoText}>Date: {invoice.issuedDate}</Text>
            <Text style={[styles.infoText, { marginTop: 10 }]}>From: {company.name}</Text>
            <Text style={styles.infoText}>{company.address}</Text>
            <Text style={styles.infoText}>{company.email}</Text>
            <Text style={styles.infoText}>{company.website}</Text>
          </View>
        </View>

        {/* ── ITEMS TABLE ── */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colItem]}>Item</Text>
          <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.colPrice]}>Unit Price</Text>
          <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
        </View>

        {items.map((item, i) => (
          <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
            <View style={styles.colItem}>
              <Text style={styles.itemNameText}>{item.name}</Text>
              {item.description ? (
                <Text style={styles.itemDescText}>{item.description}</Text>
              ) : null}
            </View>
            <Text style={[styles.totalsValue, styles.colQty]}>{item.quantity}</Text>
            <Text style={[styles.totalsValue, styles.colPrice]}>{formatCurrency(item.unitPrice)}</Text>
            <Text style={[styles.totalsValue, styles.colTotal]}>{formatCurrency(item.total)}</Text>
          </View>
        ))}

        {/* ── TOTALS ── */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsTable}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatCurrency(totals.subtotal)}</Text>
            </View>

            {totals.discount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>
                  Discount{totals.promoCode ? ` (${totals.promoCode})` : ''}
                </Text>
                <Text style={styles.discountValue}>-{formatCurrency(totals.discount)}</Text>
              </View>
            )}

            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Shipping</Text>
              {totals.shipping === 0 ? (
                <Text style={styles.freeShipValue}>Complimentary</Text>
              ) : (
                <Text style={styles.totalsValue}>{formatCurrency(totals.shipping)}</Text>
              )}
            </View>

            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Tax (8%)</Text>
              <Text style={styles.totalsValue}>{formatCurrency(totals.tax)}</Text>
            </View>

            <View style={styles.totalDivider} />

            <View style={styles.totalsRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(totals.total)}</Text>
            </View>
          </View>
        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.thankYou}>THANK YOU FOR YOUR ORDER</Text>
          <Text style={styles.footerText}>
            {company.name}  ·  {company.address}  ·  {company.email}  ·  {company.website}
          </Text>
          <Text style={[styles.footerText, { marginTop: 3 }]}>
            For any queries regarding this invoice please contact {company.email}
          </Text>
        </View>

      </Page>
    </Document>
  );
}
