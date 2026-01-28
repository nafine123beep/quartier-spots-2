/**
 * Unit Tests: Highlight Configuration
 *
 * Tests for highlightConfig.ts utility functions.
 * Run with: ts-node tests/unit/highlightConfig.test.ts
 * Or: node --loader ts-node/esm tests/unit/highlightConfig.test.ts
 */

import {
  BASE_HIGHLIGHT_TYPES,
  AVAILABLE_HIGHLIGHT_ICONS,
  getHighlightTypeLabel,
  getHighlightIcon,
  getAllHighlightTypes,
} from '../../app/flohmarkt/lib/highlightConfig';
import { CustomHighlightType, HighlightTypeDefinition } from '../../app/flohmarkt/types';

// Simple test framework
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    testsFailed++;
    throw new Error(message);
  } else {
    console.log(`  ✓ ${message}`);
    testsPassed++;
  }
}

function test(name: string, fn: () => void | Promise<void>) {
  testsRun++;
  console.log(`\nTest: ${name}`);
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.catch((error) => {
        console.error(`  ❌ FAIL: ${error.message}`);
        testsFailed++;
      });
    }
  } catch (error: any) {
    console.error(`  ❌ FAIL: ${error.message}`);
    testsFailed++;
  }
}

// Tests
console.log('='.repeat(60));
console.log('Running Highlight Config Unit Tests');
console.log('='.repeat(60));

test('BASE_HIGHLIGHT_TYPES contains 8 predefined types', () => {
  assert(BASE_HIGHLIGHT_TYPES.length === 8, `Expected 8 types, got ${BASE_HIGHLIGHT_TYPES.length}`);
});

test('BASE_HIGHLIGHT_TYPES have unique keys', () => {
  const keys = BASE_HIGHLIGHT_TYPES.map(t => t.key);
  const uniqueKeys = new Set(keys);
  assert(keys.length === uniqueKeys.size, 'Keys are not unique');
});

test('BASE_HIGHLIGHT_TYPES have valid structure', () => {
  BASE_HIGHLIGHT_TYPES.forEach((type, index) => {
    assert(typeof type.key === 'string', `Type ${index}: key should be string`);
    assert(type.key.length > 0, `Type ${index}: key should not be empty`);
    assert(typeof type.label === 'string', `Type ${index}: label should be string`);
    assert(type.label.length > 0, `Type ${index}: label should not be empty`);
    assert(typeof type.icon === 'string', `Type ${index}: icon should be string`);
    assert(type.icon.length > 0, `Type ${index}: icon should not be empty`);
  });
});

test('BASE_HIGHLIGHT_TYPES includes expected types', () => {
  const keys = BASE_HIGHLIGHT_TYPES.map(t => t.key);
  const expectedKeys = ['registration', 'toilets', 'food_drinks', 'start', 'finish', 'awareness_team', 'info_point', 'parking'];

  expectedKeys.forEach(key => {
    assert(keys.includes(key), `Expected type "${key}" not found`);
  });
});

test('AVAILABLE_HIGHLIGHT_ICONS contains 10 icons', () => {
  assert(AVAILABLE_HIGHLIGHT_ICONS.length === 10, `Expected 10 icons, got ${AVAILABLE_HIGHLIGHT_ICONS.length}`);
});

test('AVAILABLE_HIGHLIGHT_ICONS are valid emoji strings', () => {
  AVAILABLE_HIGHLIGHT_ICONS.forEach((icon, index) => {
    assert(typeof icon === 'string', `Icon ${index}: should be string`);
    assert(icon.length > 0, `Icon ${index}: should not be empty`);
  });
});

test('getHighlightTypeLabel returns label for base type', () => {
  const label = getHighlightTypeLabel('registration', []);
  assert(label === 'Registration / Check-in', `Expected "Registration / Check-in", got "${label}"`);
});

test('getHighlightTypeLabel returns label for custom type', () => {
  const customTypes: CustomHighlightType[] = [
    { id: '1', event_id: 'event1', type_key: 'first_aid', label: 'First Aid', icon: '⚕️', created_at: '2024-01-01T00:00:00Z' }
  ];
  const label = getHighlightTypeLabel('first_aid', customTypes);
  assert(label === 'First Aid', `Expected "First Aid", got "${label}"`);
});

test('getHighlightTypeLabel returns key if type not found', () => {
  const label = getHighlightTypeLabel('unknown_type', []);
  assert(label === 'unknown_type', `Expected "unknown_type", got "${label}"`);
});

test('getHighlightTypeLabel prioritizes base types over custom types', () => {
  const customTypes: CustomHighlightType[] = [
    { id: '1', event_id: 'event1', type_key: 'registration', label: 'Custom Registration', icon: '📝', created_at: '2024-01-01T00:00:00Z' }
  ];
  const label = getHighlightTypeLabel('registration', customTypes);
  assert(label === 'Registration / Check-in', `Base type should win, got "${label}"`);
});

test('getHighlightIcon returns icon for base type', () => {
  const icon = getHighlightIcon('toilets', []);
  assert(icon === '🚻', `Expected "🚻", got "${icon}"`);
});

test('getHighlightIcon returns icon for custom type', () => {
  const customTypes: CustomHighlightType[] = [
    { id: '1', event_id: 'event1', type_key: 'bike_repair', label: 'Bike Repair', icon: '🚲', created_at: '2024-01-01T00:00:00Z' }
  ];
  const icon = getHighlightIcon('bike_repair', customTypes);
  assert(icon === '🚲', `Expected "🚲", got "${icon}"`);
});

test('getHighlightIcon returns default icon if type not found', () => {
  const icon = getHighlightIcon('unknown', []);
  assert(icon === '📍', `Expected default icon "📍", got "${icon}"`);
});

test('getHighlightIcon prioritizes base types over custom types', () => {
  const customTypes: CustomHighlightType[] = [
    { id: '1', event_id: 'event1', type_key: 'parking', label: 'Custom Parking', icon: '🚗', created_at: '2024-01-01T00:00:00Z' }
  ];
  const icon = getHighlightIcon('parking', customTypes);
  assert(icon === '🅿️', `Base type icon should win, got "${icon}"`);
});

test('getAllHighlightTypes combines base and custom types', () => {
  const mockCustomTypes: CustomHighlightType[] = [
    {
      id: '1',
      event_id: 'event1',
      type_key: 'first_aid',
      label: 'First Aid',
      icon: '⚕️',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      event_id: 'event1',
      type_key: 'bike_parking',
      label: 'Bike Parking',
      icon: '🚲',
      created_at: '2024-01-01T00:00:00Z',
    },
  ];

  const allTypes = getAllHighlightTypes(mockCustomTypes);

  // Should have 8 base + 2 custom = 10 total
  assert(allTypes.length === 10, `Expected 10 types, got ${allTypes.length}`);

  // Check base types are included
  const hasRegistration = allTypes.some(t => t.key === 'registration');
  assert(hasRegistration, 'Base type "registration" should be included');

  // Check custom types are included
  const hasFirstAid = allTypes.some(t => t.key === 'first_aid');
  assert(hasFirstAid, 'Custom type "first_aid" should be included');

  const hasBikeParking = allTypes.some(t => t.key === 'bike_parking');
  assert(hasBikeParking, 'Custom type "bike_parking" should be included');
});

test('getAllHighlightTypes handles empty custom types', () => {
  const allTypes = getAllHighlightTypes([]);
  assert(allTypes.length === 8, `Expected 8 base types only, got ${allTypes.length}`);
});

test('getAllHighlightTypes converts CustomHighlightType to HighlightTypeDefinition', () => {
  const mockCustomTypes: CustomHighlightType[] = [
    {
      id: '1',
      event_id: 'event1',
      type_key: 'test_type',
      label: 'Test Type',
      icon: '🧪',
      created_at: '2024-01-01T00:00:00Z',
    },
  ];

  const allTypes = getAllHighlightTypes(mockCustomTypes);
  const testType = allTypes.find(t => t.key === 'test_type');

  assert(testType !== undefined, 'Custom type should be found');
  assert(testType!.label === 'Test Type', 'Label should match');
  assert(testType!.icon === '🧪', 'Icon should match');
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('Test Summary');
console.log('='.repeat(60));
console.log(`Tests Run:    ${testsRun}`);
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✓ All tests passed!');
  process.exit(0);
} else {
  console.log(`\n✗ ${testsFailed} test(s) failed`);
  process.exit(1);
}
