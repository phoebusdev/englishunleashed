import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import React from 'react'

// Register fonts if needed
// Font.register({
//   family: 'Roboto',
//   src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf'
// })

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#20b2aa',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  label: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 8,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginVertical: 20,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 10,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  col1: {
    flex: 3,
  },
  col2: {
    flex: 1,
    textAlign: 'right',
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#333333',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#20b2aa',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666',
  },
})

interface InvoiceData {
  invoiceNumber: string
  orderDate: string
  order: {
    id: string
    user: {
      name?: string | null
      email?: string | null
    }
    product: {
      title: string
      description?: string | null
    }
    amount: number // in cents
    promoCode?: {
      code: string
      discountType: string
      discountValue: number
    } | null
  }
  companyInfo: {
    name: string
    address?: string
    email: string
    website: string
  }
}

export const InvoiceTemplate: React.FC<{ data: InvoiceData }> = ({ data }) => {
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const calculateDiscount = () => {
    if (!data.order.promoCode) return 0
    
    if (data.order.promoCode.discountType === 'PERCENTAGE') {
      return (data.order.amount * data.order.promoCode.discountValue) / 100
    } else {
      return data.order.promoCode.discountValue
    }
  }

  const subtotal = data.order.amount + calculateDiscount()
  const discount = calculateDiscount()
  const total = data.order.amount

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{data.companyInfo.name}</Text>
          <Text style={styles.subtitle}>Invoice</Text>
        </View>

        {/* Invoice Info */}
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Invoice Number</Text>
            <Text style={styles.value}>{data.invoiceNumber}</Text>
            
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{data.orderDate}</Text>
          </View>
          
          <View>
            <Text style={styles.label}>From</Text>
            <Text style={styles.value}>{data.companyInfo.name}</Text>
            {data.companyInfo.address && (
              <Text style={styles.value}>{data.companyInfo.address}</Text>
            )}
            <Text style={styles.value}>{data.companyInfo.email}</Text>
            <Text style={styles.value}>{data.companyInfo.website}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bill To */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={styles.value}>{data.order.user.name || 'Guest User'}</Text>
          <Text style={styles.value}>{data.order.user.email}</Text>
        </View>

        <View style={styles.divider} />

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Description</Text>
              <Text style={styles.col2}>Amount</Text>
            </View>
            
            <View style={styles.tableRow}>
              <View style={styles.col1}>
                <Text style={{ fontSize: 12, marginBottom: 4 }}>{data.order.product.title}</Text>
                {data.order.product.description && (
                  <Text style={{ fontSize: 10, color: '#666666' }}>
                    {data.order.product.description}
                  </Text>
                )}
              </View>
              <Text style={[styles.col2, { fontSize: 12 }]}>
                {formatCurrency(subtotal)}
              </Text>
            </View>
            
            {data.order.promoCode && (
              <View style={styles.tableRow}>
                <View style={styles.col1}>
                  <Text style={{ fontSize: 11, color: '#666666' }}>
                    Discount ({data.order.promoCode.code})
                  </Text>
                </View>
                <Text style={[styles.col2, { fontSize: 11, color: '#666666' }]}>
                  -{formatCurrency(discount)}
                </Text>
              </View>
            )}
          </View>

          {/* Total */}
          <View style={styles.total}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your purchase!</Text>
          <Text style={{ marginTop: 5 }}>
            This invoice was generated automatically. For questions, contact {data.companyInfo.email}
          </Text>
        </View>
      </Page>
    </Document>
  )
}