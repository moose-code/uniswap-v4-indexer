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
  HookStats,
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
    chainId: BigInt(event.chainId),
    currency0: event.params.currency0,
    currency1: event.params.currency1,
    fee: event.params.fee,
    tickSpacing: event.params.tickSpacing,
    hooks: event.params.hooks,
    numberOfSwaps: BigInt(0),
    createdAtTimestamp: BigInt(event.block.timestamp),
    createdAtBlockNumber: BigInt(event.block.number),
  };

  const isHookedPool =
    event.params.hooks !== "0x0000000000000000000000000000000000000000";

  // Update global stats
  const statsId = event.chainId.toString();
  let stats = await context.GlobalStats.get(statsId);

  if (!stats) {
    stats = {
      id: statsId,
      numberOfSwaps: BigInt(0),
      numberOfPools: BigInt(0),
      hookedPools: BigInt(0),
      hookedSwaps: BigInt(0),
    };
  }

  stats = {
    ...stats,
    numberOfPools: stats.numberOfPools + BigInt(1),
    hookedPools: stats.hookedPools + (isHookedPool ? BigInt(1) : BigInt(0)),
  };

  // Update hook specific stats if it's a hooked pool
  if (isHookedPool) {
    let hookStats = await context.HookStats.get(event.params.hooks);

    if (!hookStats) {
      hookStats = {
        id: event.params.hooks,
        chainId: BigInt(event.chainId),
        numberOfPools: BigInt(0),
        numberOfSwaps: BigInt(0),
        firstPoolCreatedAt: BigInt(event.block.timestamp),
      };
    }

    hookStats = {
      ...hookStats,
      numberOfPools: hookStats.numberOfPools + BigInt(1),
    };

    await context.HookStats.set(hookStats);
  }

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

  let pool = await context.Pool.get(event.params.id);
  if (pool) {
    pool = {
      ...pool,
      numberOfSwaps: pool.numberOfSwaps + BigInt(1),
    };
  } else {
    return;
  }

  const isHookedPool =
    pool.hooks !== "0x0000000000000000000000000000000000000000";

  // Update global stats
  const statsId = event.chainId.toString();
  let stats = await context.GlobalStats.get(statsId);

  if (!stats) {
    stats = {
      id: statsId,
      numberOfSwaps: BigInt(0),
      numberOfPools: BigInt(0),
      hookedPools: BigInt(0),
      hookedSwaps: BigInt(0),
    };
  }

  stats = {
    ...stats,
    numberOfSwaps: stats.numberOfSwaps + BigInt(1),
    hookedSwaps: stats.hookedSwaps + (isHookedPool ? BigInt(1) : BigInt(0)),
  };

  // Update hook specific stats
  if (isHookedPool) {
    let hookStats = await context.HookStats.get(pool.hooks);
    if (hookStats) {
      hookStats = {
        ...hookStats,
        numberOfSwaps: hookStats.numberOfSwaps + BigInt(1),
      };
      await context.HookStats.set(hookStats);
    }
  }

  await context.Pool.set(pool);
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
