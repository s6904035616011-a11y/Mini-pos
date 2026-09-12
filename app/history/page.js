'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function HistoryPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // ดึงประวัติการขายเมื่อเริ่มโหลดหน้าเว็บ
  useEffect(() => {
    fetchSalesHistory();
  }, []);

  // ฟังก์ชันดึงข้อมูลจากตาราง sales เรียงจากล่าสุดไปเก่าสุด
  const fetchSalesHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('sold_at', { ascending: false });

    if (error) {
      alert('เกิดข้อผิดพลาดในการดึงประวัติการขาย: ' + error.message);
    } else {
      setSales(data || []);
    }
    setLoading(false);
  };

  // คำนวณยอดขายรวมทั้งหมด (Sum ของ total_price)
  const grandTotal = sales.reduce(
    (sum, item) => sum + (Number(item.total_price) || 0),
    0
  );

  // ฟังก์ชันแปลงรูปแบบวันเวลาให้อ่านง่าย
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* ส่วนสรุปยอดขายรวม */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ebf4ff',
          borderColor: '#c3dafe',
        }}
      >
        <div>
          <h2 style={{ color: 'var(--primary)', marginBottom: '0.2rem' }}>
            📊 สรุปยอดขายทั้งหมด
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            รวมรายการขายทั้งหมด {sales.length.toLocaleString()} รายการ
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            ยอดขายรวมทั้งสิ้น
          </span>
          <div
            style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: 'var(--primary)',
            }}
          >
            ฿{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* ส่วนตารางแสดงประวัติการขาย */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>
          📜 รายการประวัติการขาย (เรียงจากล่าสุด)
        </h3>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            กำลังโหลดข้อมูลประวัติการขาย...
          </p>
        ) : sales.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            ยังไม่มีประวัติการขายในระบบ
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>วันเวลาที่ขาย</th>
                  <th>ชื่อสินค้า</th>
                  <th style={{ textAlign: 'right' }}>จำนวน</th>
                  <th style={{ textAlign: 'right' }}>ยอดรวม (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.sold_at)}</td>
                    <td>
                      <strong>{item.product_name}</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {Number(item.quantity).toLocaleString()}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: '600',
                        color: 'var(--success)',
                      }}
                    >
                      {Number(item.total_price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
