import assert from "assert";
import { 
  TestHelpers,
  PoolManager_Approval
} from "generated";
const { MockDb, PoolManager } = TestHelpers;

describe("PoolManager contract Approval event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for PoolManager contract Approval event
  const event = PoolManager.Approval.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("PoolManager_Approval is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await PoolManager.Approval.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualPoolManagerApproval = mockDbUpdated.entities.PoolManager_Approval.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedPoolManagerApproval: PoolManager_Approval = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      owner: event.params.owner,
      spender: event.params.spender,
      id: event.params.id,
      amount: event.params.amount,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualPoolManagerApproval, expectedPoolManagerApproval, "Actual PoolManagerApproval should be the same as the expectedPoolManagerApproval");
  });
});
