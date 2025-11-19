const OPERATORS = {
  '+': { precedence: 1, apply: (a, b) => a + b },
  '-': { precedence: 1, apply: (a, b) => a - b },
  '*': { precedence: 2, apply: (a, b) => a * b },
  '/': {
    precedence: 2,
    apply: (a, b) => {
      if (b === 0) {
        throw new Error('0으로는 나눌 수 없어요.');
      }
      return a / b;
    },
  },
};

const isDigit = (char) => /[0-9]/.test(char);

const preprocess = (raw) => raw.replace(/[,:\n]+/g, '+').replace(/\s+/g, '');

const tokenize = (expression) => {
  const tokens = [];
  let numberBuffer = '';
  let previousType = null;

  const flushNumber = () => {
    if (!numberBuffer) {
      return;
    }

    if (numberBuffer === '-' || numberBuffer === '+') {
      throw new Error('숫자를 완성해 주세요.');
    }

    const parsed = Number(numberBuffer);
    if (Number.isNaN(parsed)) {
      throw new Error('숫자를 해석할 수 없어요.');
    }

    tokens.push({ type: 'number', value: parsed });
    numberBuffer = '';
    previousType = 'number';
  };

  for (const char of expression) {
    if (isDigit(char)) {
      numberBuffer += char;
      continue;
    }

    if (char === '.') {
      if (numberBuffer.includes('.')) {
        throw new Error('올바르지 않은 소수 표현이에요.');
      }
      if (numberBuffer === '' || numberBuffer === '-') {
        numberBuffer += '0';
      }
      numberBuffer += '.';
      continue;
    }

    if (
      char === '-' &&
      (previousType === null ||
        previousType === 'operator' ||
        previousType === 'parenLeft')
    ) {
      if (numberBuffer === '') {
        numberBuffer = '-';
        continue;
      }
    }

    if (OPERATORS[char]) {
      flushNumber();

      if (
        previousType === null ||
        previousType === 'operator' ||
        previousType === 'parenLeft'
      ) {
        throw new Error('연산자 사이에 숫자가 필요해요.');
      }

      tokens.push({ type: 'operator', value: char });
      previousType = 'operator';
      continue;
    }

    if (char === '(') {
      flushNumber();
      tokens.push({ type: 'parenLeft', value: char });
      previousType = 'parenLeft';
      continue;
    }

    if (char === ')') {
      flushNumber();
      if (
        previousType === 'operator' ||
        previousType === 'parenLeft' ||
        previousType === null
      ) {
        throw new Error('괄호 안에 숫자가 필요해요.');
      }
      tokens.push({ type: 'parenRight', value: char });
      previousType = 'parenRight';
      continue;
    }

    throw new Error(`지원하지 않는 문자(${char})가 포함되어 있어요.`);
  }

  flushNumber();

  if (previousType === 'operator' || previousType === 'parenLeft') {
    throw new Error('수식이 연산자로 끝날 수 없어요.');
  }

  return tokens;
};

const toRpn = (tokens) => {
  const output = [];
  const operatorStack = [];

  tokens.forEach((token) => {
    if (token.type === 'number') {
      output.push(token);
      return;
    }

    if (token.type === 'operator') {
      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (
          top.type !== 'operator' ||
          OPERATORS[top.value].precedence < OPERATORS[token.value].precedence
        ) {
          break;
        }
        output.push(operatorStack.pop());
      }
      operatorStack.push(token);
      return;
    }

    if (token.type === 'parenLeft') {
      operatorStack.push(token);
      return;
    }

    if (token.type === 'parenRight') {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1].type !== 'parenLeft'
      ) {
        output.push(operatorStack.pop());
      }

      if (
        operatorStack.length === 0 ||
        operatorStack[operatorStack.length - 1].type !== 'parenLeft'
      ) {
        throw new Error('괄호 짝이 맞지 않아요.');
      }

      operatorStack.pop();
    }
  });

  while (operatorStack.length > 0) {
    const token = operatorStack.pop();
    if (token.type === 'parenLeft' || token.type === 'parenRight') {
      throw new Error('괄호 짝이 맞지 않아요.');
    }
    output.push(token);
  }

  return output;
};

const evaluateRpn = (tokens) => {
  const stack = [];

  tokens.forEach((token) => {
    if (token.type === 'number') {
      stack.push(token.value);
      return;
    }

    if (token.type !== 'operator') {
      throw new Error('알 수 없는 토큰이 포함되어 있어요.');
    }

    const b = stack.pop();
    const a = stack.pop();
    if (a === undefined || b === undefined) {
      throw new Error('연산에 필요한 숫자가 부족해요.');
    }

    const value = OPERATORS[token.value].apply(a, b);
    if (!Number.isFinite(value)) {
      throw new Error('유효하지 않은 계산입니다.');
    }

    stack.push(value);
  });

  if (stack.length !== 1) {
    throw new Error('수식을 해석할 수 없어요.');
  }

  return stack[0];
};

export const evaluateExpression = (rawInput) => {
  const trimmed = (rawInput ?? '').trim();
  if (!trimmed) {
    return { error: '계산할 값을 입력해 주세요.' };
  }

  try {
    const normalized = preprocess(trimmed);
    const tokens = tokenize(normalized);
    if (tokens.length === 0) {
      return { error: '숫자를 찾을 수 없어요.' };
    }

    const rpn = toRpn(tokens);
    const value = evaluateRpn(rpn);
    return { result: value };
  } catch (error) {
    return { error: error.message };
  }
};
