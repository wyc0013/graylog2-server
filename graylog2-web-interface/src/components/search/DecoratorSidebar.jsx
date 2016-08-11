import React from 'react';
import Reflux from 'reflux';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';

import { SortableList, Spinner } from 'components/common';
import { AddDecoratorButton, Decorator } from 'components/search';
import DocsHelper from 'util/DocsHelper';

import StoreProvider from 'injection/StoreProvider';
const DecoratorsStore = StoreProvider.getStore('Decorators');

import ActionsProvider from 'injection/ActionsProvider';
const DecoratorsActions = ActionsProvider.getActions('Decorators');

import DecoratorStyles from '!style!css!components/search/decoratorStyles.css';

const DecoratorSidebar = React.createClass({
  propTypes: {
    stream: React.PropTypes.string,
  },
  mixins: [Reflux.connect(DecoratorsStore)],
  _formatDecorator(decorator) {
    const typeDefinition = this.state.types[decorator.type] || { requested_configuration: {}, name: `Unknown type: ${decorator.type}` };
    return ({ id: decorator._id, title: <Decorator key={`decorator-${decorator._id}`}
                                                   decorator={decorator}
                                                   typeDefinition={typeDefinition} /> });
  },
  _updateOrder(decorators) {
    decorators.forEach((item, idx) => {
      const decorator = this.state.decorators.find((i) => i._id === item.id);
      decorator.order = idx;
      DecoratorsActions.update(decorator._id, decorator);
    });
  },
  render() {
    if (!this.state.decorators) {
      return <Spinner />;
    }
    const decorators = this.state.decorators
      .filter((decorator) => (this.props.stream ? decorator.stream === this.props.stream : !decorator.stream))
      .sort((d1, d2) => d1.order - d2.order);
    const nextDecoratorOrder = decorators.length > 0 ? decorators[decorators.length - 1].order + 1 : 0;
    const decoratorItems = decorators.map(this._formatDecorator);
    const popoverHelp = (
      <Popover id="decorators-help" className={DecoratorStyles.helpPopover}>
        <p className="description">
          Decorators can modify messages shown in the search results on the fly. These changes are not stored, but only
          shown in the search results. Decorator config is stored <strong>per stream</strong>.
        </p>
        <p className="description">
          Use drag and drop to modify the order in which decorators are processed.
        </p>
        <p>
          Read more about message decorators in the <a href={DocsHelper.toString('decorators.html')}>documentation</a>.
        </p>
      </Popover>
    );
    return (
      <div>
        <AddDecoratorButton stream={this.props.stream} nextOrder={nextDecoratorOrder}/>
        <SortableList items={decoratorItems} onMoveItem={this._updateOrder} />
        <OverlayTrigger trigger="click" rootClose placement="right" overlay={popoverHelp}>
          <Button bsStyle="link" className={DecoratorStyles.helpLink}>What are message decorators? <i className="fa fa-question-circle" /></Button>
        </OverlayTrigger>
      </div>
    );
  },
});

export default DecoratorSidebar;
