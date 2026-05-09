import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: 40, textAlign: 'center', background: 'var(--bg1)', color: 'var(--text)'
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>💥</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Đã xảy ra lỗi</h1>
          <p style={{ color: 'var(--text2)', marginBottom: 24, maxWidth: 480 }}>
            Ứng dụng gặp lỗi không mong muốn. Vui lòng thử lại hoặc liên hệ quản trị viên.
          </p>
          {this.state.error && (
            <details style={{
              marginBottom: 24, padding: 16, background: 'var(--bg3)', borderRadius: 8,
              maxWidth: 600, width: '100%', textAlign: 'left', fontSize: 12, color: 'var(--text3)',
              fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: 8 }}>Chi tiết lỗi</summary>
              {this.state.error.toString()}
            </details>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" onClick={this.handleReset}>🔄 Thử lại</button>
            <button className="btn btn-secondary" onClick={() => window.location.href = '/'}>🏠 Về trang chủ</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
