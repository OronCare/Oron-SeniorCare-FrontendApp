import { CarePlan } from '../../types';
import { Badge, Button } from '../UI';

export const MetadataBanner = ({
  carePlan,
  canManage,
}: {
  carePlan: CarePlan;
  canManage: boolean;
}) => {
    if (!carePlan) return null;
    
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500 font-medium">Version</p>
            <p className="text-sm font-semibold text-slate-900">v{carePlan.version || '1.0'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Last Review</p>
            <p className="text-sm text-slate-700">
              {carePlan.lastReviewDate ? new Date(carePlan.lastReviewDate).toLocaleDateString() : 'Not reviewed'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Next Review</p>
            <p className="text-sm text-slate-700">
              {carePlan.nextReviewDate ? new Date(carePlan.nextReviewDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Author</p>
            <p className="text-sm text-slate-700">{carePlan.author || 'System'}</p>
          </div>
        </div>
        <div className="mt-3 border-t border-slate-100 pt-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Electronic signature status:</span>
            <Badge variant={carePlan.signed ? 'success' : 'warning'} className="px-2 py-0.5 text-xs">
              {carePlan.signed ? 'Signed' : 'Pending acknowledgment'}
            </Badge>
          </div>
          {canManage && !carePlan.signed && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => alert('Acknowledge clicked')}>
              Acknowledge & Sign
            </Button>
          )}
        </div>
      </div>
    );
  };