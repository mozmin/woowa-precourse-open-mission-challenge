import { useMemo, useState } from 'react';
import { evaluateExpression } from './calculatorCore';
import './Calculator.css';

const formatResult = (value) => {
  if (value === null || value === undefined) {
    return '-';
  }

  if (Number.isInteger(value)) {
    return value.toString();
  }

  const trimmed = value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  return trimmed || '0';
};

function Calculator() {
  const [expression, setExpression] = useState('1, 2, 3');
  const [result, setResult] = useState(6);
  const [error, setError] = useState('');

  const formattedResult = useMemo(() => formatResult(result), [result]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const input = expression.trim();
    if (!input) {
      setError('계산할 값을 입력해 주세요.');
      setResult(null);
      return;
    }

    const { result: value, error: calcError } = evaluateExpression(input);
    if (calcError) {
      setError(calcError);
      setResult(null);
      return;
    }

    setError('');
    setResult(value);
  };

  return (
    <section className="calculator">
      <div className="calculator__panel">
        <p className="calculator__question">덧셈할 문자열을 입력해 주세요.</p>

        <form className="calculator__form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="calculator-input">
            계산식 입력
          </label>
          <input
            id="calculator-input"
            className="calculator__input"
            type="text"
            value={expression}
            onChange={(event) => setExpression(event.target.value)}
            placeholder="예: 1,2,3 또는 1 + 2.5 - 3"
            aria-describedby="calculator-helper"
          />

          <button type="submit" className="calculator__submit">
            결과 확인
          </button>
        </form>

        <div className="calculator__result">
          <span className="calculator__result-label">결과 :</span>
          <span className="calculator__result-value">{formattedResult}</span>
        </div>

        {error ? (
          <p className="calculator__error" role="alert">
            {error}
          </p>
        ) : (
          <p className="calculator__helper" id="calculator-helper">
            쉼표(,)나 콜론(:)으로 숫자를 나누면 자동으로 더해지고, 사칙연산
            기호와 괄호, 소수, 음수도 그대로 사용할 수 있어요.
          </p>
        )}
      </div>
    </section>
  );
}

export default Calculator;
