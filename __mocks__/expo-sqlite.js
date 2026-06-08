// __mocks__/expo-sqlite.js
// 内存版 expo-sqlite mock —— 用 Map 记录 SQL 调用与返回数据
// 仅用于单元测试，不模拟真实 SQL 执行。query 模式会按参数匹配预设结果。

const tables = new Map(); // tableName -> Map<rowId, row>

// 预设响应（每个测试可在 beforeEach 覆盖）
const fixtures = {
  getFirstAsync: [],     // pop 0
  getAllAsync: [],       // pop 0
  runAsync: { lastInsertRowId: 1, changes: 1 },
};

let nextInsertId = 1;

const mockDb = {
  execAsync: jest.fn(async () => undefined),
  runAsync: jest.fn(async (sql, params = []) => {
    // 简单模拟 INSERT，返回递增 id
    if (/INSERT\s+INTO/i.test(sql)) {
      const id = nextInsertId++;
      // 解析表名（粗略）
      const m = sql.match(/INSERT\s+INTO\s+(\w+)/i);
      const table = m?.[1];
      if (table) {
        if (!tables.has(table)) tables.set(table, new Map());
        tables.get(table).set(id, { id, ...params });
      }
      return { lastInsertRowId: id, changes: 1 };
    }
    return fixtures.runAsync;
  }),
  getFirstAsync: jest.fn(async () => fixtures.getFirstAsync.shift() ?? null),
  getAllAsync: jest.fn(async () => fixtures.getAllAsync.shift() ?? []),
  withTransactionAsync: jest.fn(async (fn) => fn()),
  closeAsync: jest.fn(async () => undefined),
  // 测试辅助
  __setFirstAsyncFixture: (val) => {
    fixtures.getFirstAsync = [val];
  },
  __setAllAsyncFixture: (val) => {
    fixtures.getAllAsync = [val];
  },
  __reset: () => {
    tables.clear();
    nextInsertId = 1;
    fixtures.getFirstAsync = [];
    fixtures.getAllAsync = [];
    mockDb.execAsync.mockClear();
    mockDb.runAsync.mockClear();
    mockDb.getFirstAsync.mockClear();
    mockDb.getAllAsync.mockClear();
  },
};

module.exports = {
  openDatabaseAsync: jest.fn(async () => mockDb),
  __mockDb: mockDb,
};
