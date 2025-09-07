module.exports = {
  rules: {
    // 🚨 Math.random 사용 금지
    'no-restricted-properties': ['error', {
      object: 'Math',
      property: 'random',
      message: '❌ Math.random() 사용 금지! 실제 API 데이터를 사용하세요.'
    }],
    
    // 🚨 금지된 변수명 패턴
    'no-restricted-syntax': [
      'error',
      {
        selector: "Identifier[name=/^(mock|fake|dummy|sample|test|temp)/i]",
        message: '❌ Mock/Fake/Dummy/Sample/Test 변수명 사용 금지!'
      },
      {
        selector: "CallExpression[callee.name='setTimeout'][arguments.0.body.body.0.expression.callee.name=/simulate/i]",
        message: '❌ setTimeout으로 시뮬레이션 함수 호출 금지!'
      }
    ],
    
    // 🚨 하드코딩된 값 경고
    'no-magic-numbers': ['warn', {
      ignore: [0, 1, -1, 2, 100, 1000],
      ignoreArrayIndexes: true,
      ignoreDefaultValues: true,
      enforceConst: true
    }],
    
    // 🚨 TODO/FIXME 주석 경고
    'no-warning-comments': ['warn', {
      terms: ['임시', '테스트', 'TODO', 'FIXME', 'HACK', 'XXX', 'mock', 'fake'],
      location: 'anywhere'
    }]
  }
};