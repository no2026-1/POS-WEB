import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { customerCreditApi } from './customer-credit.api'
import { customerApi } from '@/features/customer/customer.api'

export default function CustomerCreditPage() {
  const { t } = useTranslation()
  const [customerId, setCustomerId] = useState('')
  const [txType, setTxType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['customer-credits', page, customerId, txType, dateFrom, dateTo],
    queryFn: () => customerCreditApi.getAll({
      page, limit: 20,
      customerId: customerId ? Number(customerId) : undefined,
      transactionType: txType || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
  })
  const credits = data?.data.data ?? []
  const total = (data?.data as any)?.total ?? 0
  const totalPages = Math.ceil(total / 20)

  const { data: custData } = useQuery({ queryKey: ['customers-all'], queryFn: () => customerApi.getAll({ limit: 100 }) })
  const customers = custData?.data.data.data ?? []

  function clearFilter() { setCustomerId(''); setTxType(''); setDateFrom(''); setDateTo(''); setPage(1) }
  const hasFilter = customerId || txType || dateFrom || dateTo

  const txBadge = (type: string) => {
    const m: Record<string, string> = { CHARGE: 'bg-red-100 text-red-600', PAYMENT: 'bg-green-100 text-green-700', REFUND: 'bg-blue-100 text-blue-600', ADJUST: 'bg-gray-100 text-gray-600' }
    return `inline-block px-2 py-0.5 rounded text-xs font-medium ${m[type] ?? 'bg-gray-100 text-gray-500'}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">{t('customerCredit.title')}</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
        <select value={customerId} onChange={(e) => { setCustomerId(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">{t('customer.title')}: All</option>
          {customers.map((c: any) => <option key={c.id} value={c.id}>{c.englishName}</option>)}
        </select>
        <select value={txType} onChange={(e) => { setTxType(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">{t('customerCredit.txType')}: All</option>
          <option value="CHARGE">CHARGE</option>
          <option value="PAYMENT">PAYMENT</option>
          <option value="REFUND">REFUND</option>
          <option value="ADJUST">ADJUST</option>
        </select>
        <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        {hasFilter && <button onClick={clearFilter} className="text-xs text-blue-500 hover:underline">{t('stock.clearFilter')}</button>}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('customerCredit.creditDate')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('customer.title')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('customerCredit.txType')}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('customerCredit.debit')}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('customerCredit.credit')}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('customerCredit.balance')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{t('common.loading')}</td></tr>
            ) : credits.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
            ) : (credits as any[]).map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{c.creditDate?.slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{c.customer?.englishName ?? `#${c.customerId}`}</p>
                  <p className="text-xs text-gray-400">{c.customer?.customerNo}</p>
                </td>
                <td className="px-4 py-3"><span className={txBadge(c.transactionType)}>{c.transactionType}</span></td>
                <td className="px-4 py-3 text-right text-red-500">{Number(c.debit) > 0 ? Number(c.debit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                <td className="px-4 py-3 text-right text-green-600">{Number(c.credit) > 0 ? Number(c.credit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-800">{Number(c.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>{t('common.total')}: {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">{t('common.previous')}</button>
            <span className="px-3 py-1">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">{t('common.next')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
