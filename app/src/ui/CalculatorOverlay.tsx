import { calculatorExpression } from '../engine/shop';
import type { GameState } from '../engine/types';

interface Props {
  state: GameState;
  onKey: (key: string) => void;
  onClose: () => void;
}

const KEYS = ['7', '8', '9', '×', '4', '5', '6', '+', '1', '2', '3', '=', '0', 'C'] as const;

export function CalculatorOverlay({ state, onKey, onClose }: Props) {
  const expression = calculatorExpression(state.calculator);
  const result = state.calculator.result;
  return (
    <div
      className="overlay"
      data-testid="calculator-overlay"
      role="dialog"
      aria-modal="true"
    >
      <div className="calculator-body">
        <p className="card-stamp">آلة حساب البقالة</p>
        <p className="calc-screen" data-testid="calculator-display" dir="ltr">
          {expression || '0'}
        </p>
        <p className="calc-result" data-testid="calculator-result" dir="ltr">
          {result === null ? '' : String(result)}
        </p>
        <div className="calc-keys">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className="calc-key"
              data-testid={`calc-key-${key === '×' ? 'mul' : key === '+' ? 'add' : key === '=' ? 'eq' : key}`}
              onClick={() => onKey(key)}
            >
              {key}
            </button>
          ))}
        </div>
        <p className="hint-text">ثلاثة خبز بثلاثة وعلبتا لبن بأربعة: اضرب ثم اجمع.</p>
        <button type="button" className="ghost" data-testid="calculator-close" onClick={onClose}>
          اترك الآلة
        </button>
      </div>
    </div>
  );
}
