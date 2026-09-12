'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function SellPage() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ดึงรายการสินค้าทั้งหมดเมื่อเริ่มโหลดหน้า
  useEffect(() => {
    fetchProducts();
  }, []);

  // ฟังก์ชันดึงสินค้าจาก Supabase
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      alert('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า: ' + error.message);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  // ดึงข้อมูลสินค้าที่ผู้ใช้อยู่ระหว่างเลือก
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // คำนวณราคารวมอัตโนมัติ (ราคา x จำนวน)
  const totalPrice = selectedProduct ? selectedProduct.price * quantity : 0;

  // ฟังก์ชันสำหรับการขายสินค้า
  const handleSell = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      alert('กรุณาเลือกสินค้าที่ต้องการขาย');
      return;
    }

    if (quantity <= 0) {
      alert('กรุณาระบุจำนวนสินค้าให้ถูกต้อง');
      return;
    }

    // 1. ตรวจสอบว่าสินค้าในสต็อกเพียงพอหรือไม่
    if (selectedProduct.stock < quantity) {
      alert(
        `สินค้าไม่พอขาย! (คงเหลือในสต็อก: ${selectedProduct.stock} ${selectedProduct.unit || 'ชิ้น'})`
      );
      return;
    }

    setSubmitting(true);

    try {
      // 2. บันทึกข้อมูลการขายลงตาราง sales
      const { error: saleError } = await supabase.from('sales').insert([
        {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          quantity: parseInt(quantity, 10),
          total_price: parseFloat(totalPrice),
          sold_at: new Date().toISOString(),
        },
      ]);

      if (saleError) throw saleError;

      // 3. อัปเดตลดจำนวนสต็อกในตาราง products
      const newStock = selectedProduct.stock - quantity;
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', selectedProduct.id);

      if (updateError) throw updateError;

      // 4. แจ้งเตือนเมื่อสำเร็จ รีเซ็ตฟอร์ม และโหลดข้อมูลสินค้าใหม่
      alert(`ขายสินค้าสำเร็จ! รวมเป็นเงิน ${totalPrice.toLocaleString()} บาท`);
      setSelectedProductId('');
      setQuantity(1);
      fetchProducts();
    } catch (error) {
      alert('เกิดข้อผิดพลาดขณะทำรายการขาย: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)', textAlign: 'center' }}>
          🛒 ทำรายการขายสินค้า
        </h2>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            กำลังโหลดข้อมูลสินค้า...
          </p>
        ) : (
          <form onSubmit={handleSell}>
            {/* เลือกสินค้า */}
            <div className="form-group">
              <label>เลือกสินค้า *</label>
              <select
                className="form-control"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
              >
                <option value="">-- เลือกรายการสินค้า --</option>
                {products.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {Number(item.price).toLocaleString()} บาท (คงเหลือ: {item.stock} {item.unit || 'ชิ้น'})
                  </option>
                ))}
              </select>
            </div>

            {/* จำนวนที่ขาย */}
            <div className="form-group">
              <label>จำนวนที่จะขาย *</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                required
              />
            </div>

            {/* แสดงรายละเอียดสินค้าและสรุปราคารวม */}
            {selectedProduct && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  margin: '1.5rem 0',
                  border: '1px solid var(--border-color)',
                }}
              >
                <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>ราคาต่อหน่วย:</span>
                  <strong>{Number(selectedProduct.price).toLocaleString()} บาท</strong>
                </p>
                <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>สต็อกคงเหลือ:</span>
                  <strong style={{ color: selectedProduct.stock < quantity ? 'var(--danger)' : 'inherit' }}>
                    {selectedProduct.stock} {selectedProduct.unit || 'ชิ้น'}
                  </strong>
                </p>
                <hr style={{ margin: '0.8rem 0', borderColor: 'var(--border-color)' }} />
                <p style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', color: 'var(--primary)' }}>
                  <span>ยอดรวมทั้งสิ้น:</span>
                  <strong>{totalPrice.toLocaleString()} บาท</strong>
                </p>
              </div>
            )}

            {/* ปุ่มยืนยันการขาย */}
            <button
              type="submit"
              className="btn btn-success"
              style={{ width: '100%', padding: '0.8rem', fontSize: '1.1rem', marginTop: '0.5rem' }}
              disabled={submitting || !selectedProductId}
            >
              {submitting ? 'กำลังทำรายการ...' : '💳 ยืนยันการชำระเงิน'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
