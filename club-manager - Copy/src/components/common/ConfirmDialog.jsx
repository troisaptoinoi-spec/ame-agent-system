import { useDialogStore } from '../../store/dialogStore';
import { useTranslation } from 'react-i18next';

export default function ConfirmDialog() {
  const { dialog, closeDialog } = useDialogStore();
  const { t } = useTranslation();

  if (!dialog) return null;

  const handleConfirm = () => {
    dialog.onConfirm();
    closeDialog();
  };

  return (
    <div className="modal-overlay fade-in" onClick={closeDialog} style={{ zIndex: 2000 }} role="dialog" aria-modal="true" aria-label={dialog.title || t('common.areYouSure')} onKeyDown={e => e.key === 'Escape' && closeDialog()} tabIndex={-1}>
      <div className="modal modal-sm scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>{dialog.danger ? '⚠️' : '❓'}</span>
            {dialog.title || t('common.areYouSure')}
          </div>
        </div>
        <div className="modal-body" style={{ color: 'var(--text2)', fontSize: 14, paddingTop: 12 }}>
          {dialog.message || t('common.thisCannotBeUndone')}
        </div>
        <div className="modal-footer" style={{ borderTop: 'none', background: 'var(--bg3)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
          <button className="btn btn-secondary" onClick={closeDialog}>{t('common.cancel')}</button>
          <button className={`btn ${dialog.danger ? 'btn-danger' : 'btn-primary'}`} onClick={handleConfirm} autoFocus>
            {t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
