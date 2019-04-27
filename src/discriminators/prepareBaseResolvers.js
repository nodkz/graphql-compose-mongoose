/* @flow */

import { EMCResolvers } from '../resolvers';
import { DiscriminatorTypeComposer } from './DiscriminatorTypeComposer';

// change type on DKey generated by composeWithMongoose
// set it to created enum ObjectTypeComposer for DKey DKeyETC
// only sets on filter and record typeComposers, since they contain our DKey
function setDKeyEnumOnITCArgs(resolver, baseTC: DiscriminatorTypeComposer<any, any>) {
  // setDKeyEnum for filter types, and on record types
  if (resolver) {
    const argNames = resolver.getArgNames();

    for (const argName of argNames) {
      if (argName === 'filter' || argName === 'record' || argName === 'records') {
        const filterArgTC = resolver.getArgITC(argName);

        if (filterArgTC) {
          filterArgTC.extendField(baseTC.getDKey(), {
            type: baseTC.getDKeyETC(),
          });
        }
      }
    }
  }
}

// recomposing sets up the DInterface as the return types for
// Also sets up DKey enum as type for DKey field on composers with filter and/or record args
// composeWithMongoose composers
export function prepareBaseResolvers(baseTC: DiscriminatorTypeComposer<any, any>) {
  for (const resolverName in EMCResolvers) {
    if (EMCResolvers.hasOwnProperty(resolverName) && baseTC.hasResolver(resolverName)) {
      const resolver = baseTC.getResolver(resolverName);

      switch (resolverName) {
        case EMCResolvers.findMany:
        case EMCResolvers.findByIds:
          resolver.setType(baseTC.getDInterface().getTypePlural());
          break;

        case EMCResolvers.findById:
        case EMCResolvers.findOne:
          resolver.setType(baseTC.getDInterface());
          break;

        case EMCResolvers.createOne:
        case EMCResolvers.updateOne:
        case EMCResolvers.updateById:
        case EMCResolvers.removeOne:
        case EMCResolvers.removeById:
          resolver.getOTC().extendField('record', {
            type: baseTC.getDInterface(),
          });
          break;

        case EMCResolvers.createMany:
          resolver.getOTC().extendField('records', {
            type: baseTC
              .getDInterface()
              .getTypePlural()
              .getTypeNonNull(),
          });
          break;

        case EMCResolvers.pagination:
          resolver.getOTC().extendField('items', {
            type: baseTC.getDInterface().getTypePlural(),
          });
          break;

        case EMCResolvers.connection:
          const edgesTC = resolver // eslint-disable-line no-case-declarations
            .getOTC()
            .getFieldOTC('edges')
            .clone(`${baseTC.getTypeName()}Edge`);

          edgesTC.extendField('node', {
            type: baseTC.getDInterface().getTypeNonNull(),
          });

          resolver.getOTC().setField(
            'edges',
            edgesTC
              .getTypeNonNull()
              .getTypePlural()
              .getTypeNonNull()
          );
          break;

        default:
      }

      setDKeyEnumOnITCArgs(resolver, baseTC);

      // set DKey as required field to create from base
      // must be done after setting DKeyEnum
      if (resolverName === EMCResolvers.createOne || resolverName === EMCResolvers.createMany) {
        const fieldName = resolverName === EMCResolvers.createMany ? 'records' : 'record';
        resolver.getArgITC(fieldName).extendField(baseTC.getDKey(), {
          type: baseTC.getDKeyETC().getTypeNonNull(),
        });
      }
    }
  }
}
