'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State สำหรับเพิ่ม/แก้ไขสินค้า
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: '',
    stock: '',
    unit: '',
  });
  
  // State สำหรับบันทึก ID ที่กำลังแก้ไข (null = โหมดเพิ่มสินค้าใหม่)
  const [editingId, setEditingId] = useState(null);

  // ดึงข้อมูลสินค้าจาก Supabase เมื่อโหลดหน้าเว็บ
  useEffect(() => {
    fetchProducts();
  }, []);

  // ฟังก์ชันดึงรายการสินค้า
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      alert('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + error.message);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  // จัดการการพิมพ์ลงใน Form Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ฟังก์ชันบันทึกข้อมูล (ใช้ทั้งเพิ่มใหม่และอัปเดต)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sku || !formData.name || !formData.price) {
      alert('กรุณากรอก รหัส SKU, ชื่อสินค้า และราคา ให้ครบถ้วน');
      return;
    }

    const payload = {
      sku: formData.sku,
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock || 0, 10),
      unit: formData.unit || 'ชิ้น',
    };

    if (editingId) {
      // โหมดแก้ไขสินค้า
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingId);

      if (error) {
        alert('เกิดข้อผิดพลาดในการอัปเดต: ' + error.message);
      } else {
        alert('อัปเดตสินค้าเรียบร้อยแล้ว');
        resetForm();
        fetchProducts();
      }
    } else {
      // โหมดเพิ่มสินค้าใหม่
      const { error } = await supabase.from('products').insert([payload]);

      if (error) {
        alert('เกิดข้อผิดพลาดในการเพิ่มสินค้า: ' + error.message);
      } else {
        alert('เพิ่มสินค้าเรียบร้อยแล้ว');
        resetForm();
        fetchProducts();
      }
    }
  };

  // เตรียม Form สำหรับการแก้ไข
  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      sku: product.sku || '',
      name: product.name || '',
      price: product.price || '',
      stock: product.stock || '',
      unit: product.unit || '',
    });
  };

  // ฟังก์ชันลบสินค้า
  const handleDelete = async (id, name) => {
    if (confirm(`คุณต้องการลบสินค้า "${name}" ใช่หรือไม่?`)) {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) {
        alert('เกิดข้อผิดพลาดในการลบ: ' + error.message);
      } else {
        alert('ลบสินค้าเรียบร้อยแล้ว');
        fetchProducts();
      }
    }
  };

  // ล้างค่าใน Form
  const resetForm = () => {
    setEditingId(null);
    setFormData({ sku: '', name: '', price: '', stock: '', unit: '' });
  };

  return (
    <div>
      {/* ส่วนฟอร์มเพิ่ม/แก้ไขสินค้า */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
          {editingId ? '✏️ แก้ไขข้อมูลสินค้า' : '➕ เพิ่มสินค้าใหม่'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
            }}
          >
            <div className="form-group">
              <label>รหัส SKU *</label>
              <input
                type="text"
                name="sku"
                className="form-control"
                placeholder="เช่น SLP-001"
                value={formData.sku}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>ชื่อสินค้า *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="เช่น หมอนยางพารา"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>ราคา (บาท) *</label>
              <input
                type="number"
                step="0.01"
                name="price"
                className="form-control"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>จำนวนคงเหลือ</label>
              <input
                type="number"
                name="stock"
                className="form-control"
                placeholder="0"
                value={formData.stock}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>หน่วยนับ</label>
              <input
                type="text"
                name="unit"
                className="form-control"
                placeholder="เช่น ใบ, ชุด, ชิ้น"
                value={formData.unit}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'บันทึกการแก้ไข' : 'บันทึกสินค้า'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn"
                style={{ backgroundColor: '#cbd5e1', color: '#1e293b' }}
                onClick={resetForm}
              >
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ส่วนแสดงตารางรายการสินค้า */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
          📦 รายการสินค้าทั้งหมด
        </h2>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            กำลังโหลดข้อมูลสินค้า...
          </p>
        ) : products.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            ยังไม่มีรายการสินค้าในระบบ
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>ชื่อสินค้า</th>
                  <th>ราคา (บาท)</th>
                  <th>คงเหลือ</th>
                  <th>หน่วย</th>
                  <th style={{ textAlign: 'center' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => (
                  <tr key={item.id}>
                    <td>{item.sku}</td>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>{Number(item.price).toLocaleString()}</td>
                    <td>
                      <span
                        style={{
                          color: item.stock <= 5 ? 'var(--danger)' : 'inherit',
                          fontWeight: item.stock <= 5 ? 'bold' : 'normal',
                        }}
                      >
                        {item.stock}
                      </span>
                    </td>
                    <td>{item.unit || 'ชิ้น'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.4rem',
                          justifyContent: 'center',
                        }}
                      >
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                          onClick={() => handleEdit(item)}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                          onClick={() => handleDelete(item.id, item.name)}
                        >
                          ลบ
                        </button>
                      </div>
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
