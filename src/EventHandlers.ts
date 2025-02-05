/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  PoolManager,
  PoolManager_Approval,
  PoolManager_Donate,
  PoolManager_Initialize,
  PoolManager_ModifyLiquidity,
  PoolManager_OperatorSet,
  PoolManager_OwnershipTransferred,
  PoolManager_ProtocolFeeControllerUpdated,
  PoolManager_ProtocolFeeUpdated,
  PoolManager_Swap,
  PoolManager_Transfer,
  PositionManager,
  PositionManager_Approval,
  PositionManager_ApprovalForAll,
  PositionManager_Subscription,
  PositionManager_Transfer,
  PositionManager_Unsubscription,
  GlobalStats,
} from "generated";

PoolManager.Approval.handler(async ({ event, context }) => {
  const entity: PoolManager_Approval = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    owner: event.params.owner,
    spender: event.params.spender,
    event_id: event.params.id,
    amount: event.params.amount,
  };

  context.PoolManager_Approval.set(entity);
});

PoolManager.Donate.handler(async ({ event, context }) => {
  const entity: PoolManager_Donate = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    event_id: event.params.id,
    sender: event.params.sender,
    amount0: event.params.amount0,
    amount1: event.params.amount1,
  };

  context.PoolManager_Donate.set(entity);
});

PoolManager.Initialize.handler(async ({ event, context }) => {
  const entity: PoolManager_Initialize = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    event_id: event.params.id,
    currency0: event.params.currency0,
    currency1: event.params.currency1,
    fee: event.params.fee,
    tickSpacing: event.params.tickSpacing,
    hooks: event.params.hooks,
    sqrtPriceX96: event.params.sqrtPriceX96,
    tick: event.params.tick,
  };

  // Create new pool entity
  const pool = {
    id: event.params.id,
    currency0: event.params.currency0,
    currency1: event.params.currency1,
    fee: event.params.fee,
    tickSpacing: event.params.tickSpacing,
    hooks: event.params.hooks,
    numberOfSwaps: BigInt(0),
    createdAtTimestamp: BigInt(event.block.timestamp),
    createdAtBlockNumber: BigInt(event.block.number),
  };

  // Update global stats
  const statsId = event.chainId.toString();
  let stats = await context.GlobalStats.get(statsId);

  if (!stats) {
    stats = {
      id: statsId,
      numberOfSwaps: BigInt(0),
      numberOfPools: BigInt(0),
    };
  }

  stats = {
    ...stats,
    numberOfPools: stats.numberOfPools + BigInt(1),
  };

  await context.Pool.set(pool);
  await context.GlobalStats.set(stats);
  await context.PoolManager_Initialize.set(entity);
});

PoolManager.ModifyLiquidity.handler(async ({ event, context }) => {
  const entity: PoolManager_ModifyLiquidity = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    event_id: event.params.id,
    sender: event.params.sender,
    tickLower: event.params.tickLower,
    tickUpper: event.params.tickUpper,
    liquidityDelta: event.params.liquidityDelta,
    salt: event.params.salt,
  };

  context.PoolManager_ModifyLiquidity.set(entity);
});

PoolManager.OperatorSet.handler(async ({ event, context }) => {
  const entity: PoolManager_OperatorSet = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    owner: event.params.owner,
    operator: event.params.operator,
    approved: event.params.approved,
  };

  context.PoolManager_OperatorSet.set(entity);
});

PoolManager.OwnershipTransferred.handler(async ({ event, context }) => {
  const entity: PoolManager_OwnershipTransferred = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    newOwner: event.params.newOwner,
  };

  context.PoolManager_OwnershipTransferred.set(entity);
});

PoolManager.ProtocolFeeControllerUpdated.handler(async ({ event, context }) => {
  const entity: PoolManager_ProtocolFeeControllerUpdated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    protocolFeeController: event.params.protocolFeeController,
  };

  context.PoolManager_ProtocolFeeControllerUpdated.set(entity);
});

PoolManager.ProtocolFeeUpdated.handler(async ({ event, context }) => {
  const entity: PoolManager_ProtocolFeeUpdated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    event_id: event.params.id,
    protocolFee: event.params.protocolFee,
  };

  context.PoolManager_ProtocolFeeUpdated.set(entity);
});

PoolManager.Swap.handler(async ({ event, context }) => {
  const entity: PoolManager_Swap = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    event_id: event.params.id,
    sender: event.params.sender,
    amount0: event.params.amount0,
    amount1: event.params.amount1,
    sqrtPriceX96: event.params.sqrtPriceX96,
    liquidity: event.params.liquidity,
    tick: event.params.tick,
    fee: event.params.fee,
  };

  // Update pool stats
  let poolData = await context.Pool.get(event.params.id);
  if (poolData) {
    poolData = {
      ...poolData,
      numberOfSwaps: poolData.numberOfSwaps + BigInt(1),
    };
    await context.Pool.set(poolData);
  }

  const statsId = event.chainId.toString();
  let stats = await context.GlobalStats.get(statsId);

  if (!stats) {
    stats = {
      id: statsId,
      numberOfSwaps: BigInt(0),
      numberOfPools: BigInt(0),
    };
  }

  stats = {
    ...stats,
    numberOfSwaps: stats.numberOfSwaps + BigInt(1),
  };

  await context.GlobalStats.set(stats);
  await context.PoolManager_Swap.set(entity);
});

PoolManager.Transfer.handler(async ({ event, context }) => {
  const entity: PoolManager_Transfer = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    caller: event.params.caller,
    from: event.params.from,
    to: event.params.to,
    event_id: event.params.id,
    amount: event.params.amount,
  };

  context.PoolManager_Transfer.set(entity);
});

PositionManager.Approval.handler(async ({ event, context }) => {
  const entity: PositionManager_Approval = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    owner: event.params.owner,
    spender: event.params.spender,
    event_id: event.params.id,
  };

  context.PositionManager_Approval.set(entity);
});

PositionManager.ApprovalForAll.handler(async ({ event, context }) => {
  const entity: PositionManager_ApprovalForAll = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    owner: event.params.owner,
    operator: event.params.operator,
    approved: event.params.approved,
  };

  context.PositionManager_ApprovalForAll.set(entity);
});

PositionManager.Subscription.handler(async ({ event, context }) => {
  const entity: PositionManager_Subscription = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    tokenId: event.params.tokenId,
    subscriber: event.params.subscriber,
  };

  context.PositionManager_Subscription.set(entity);
});

PositionManager.Transfer.handler(async ({ event, context }) => {
  const entity: PositionManager_Transfer = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    from: event.params.from,
    to: event.params.to,
    event_id: event.params.id,
  };

  context.PositionManager_Transfer.set(entity);
});

PositionManager.Unsubscription.handler(async ({ event, context }) => {
  const entity: PositionManager_Unsubscription = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    tokenId: event.params.tokenId,
    subscriber: event.params.subscriber,
  };

  context.PositionManager_Unsubscription.set(entity);
});
