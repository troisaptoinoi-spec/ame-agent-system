import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import { useToastStore } from '../../store/toastStore';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToastStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    if (!isLogin && !form.name.trim()) newErrors.name = 'Họ tên là bắt buộc';
    if (!form.email.trim()) newErrors.email = 'Email là bắt buộc';
    if (!form.password) newErrors.password = 'Mật khẩu là bắt buộc';
    if (!isLogin && form.password.length < 6) newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (!isLogin && form.password !== form.confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isLogin) {
        const result = await authService.login({
          email: form.email,
          password: form.password,
        });
        if (result.success) {
          showToast('Đăng nhập thành công', 'success');
          navigate('/');
        } else {
          setErrors({ form: result.error });
        }
      } else {
        const result = await authService.register({
          name: form.name,
          email: form.email,
          password: form.password,
        });
        if (result.success) {
          showToast('Đăng ký thành công', 'success');
          navigate('/');
        } else {
          setErrors({ form: result.error });
        }
      }
    } catch (err) {
      setErrors({ form: 'Đã xảy ra lỗi. Vui lòng thử lại.' });
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-logo">🚀 InnoHub</h1>
          <p className="login-subtitle">CLB Khởi nghiệp Đổi mới Sáng tạo</p>
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setErrors({}); }}
          >
            Đăng nhập
          </button>
          <button
            className={`login-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setErrors({}); }}
          >
            Đăng ký
          </button>
        </div>

        {errors.form && (
          <div className="login-error" role="alert">
            ⚠️ {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Họ và tên</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && <span id="name-error" className="form-error" role="alert">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              placeholder="email@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && <span id="email-error" className="form-error" role="alert">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={e => handleChange('password', e.target.value)}
              placeholder="••••••••"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && <span id="password-error" className="form-error" role="alert">{errors.password}</span>}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={e => handleChange('confirmPassword', e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
              />
              {errors.confirmPassword && <span id="confirm-password-error" className="form-error" role="alert">{errors.confirmPassword}</span>}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? '⏳ Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
          </button>
        </form>

        <div className="login-footer">
          {isLogin ? (
            <p>
              Chưa có tài khoản?{' '}
              <button className="link-btn" onClick={() => setIsLogin(false)}>Đăng ký ngay</button>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{' '}
              <button className="link-btn" onClick={() => setIsLogin(true)}>Đăng nhập</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
