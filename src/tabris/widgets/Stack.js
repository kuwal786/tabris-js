import Composite from './Composite';
import StackLayout from '../StackLayout';
import NativeObject from '../NativeObject';

export default class Stack extends Composite {

  constructor(properties) {
    super(properties);
  }

  _initLayout(props = {}) {
    let layout = props.layout || StackLayout.default;
    if ('spacing' in props || 'alignment' in props) {
      layout = new StackLayout({
        spacing: 'spacing' in props ? props.spacing : layout.spacing,
        alignment: 'alignment' in props ? props.alignment : layout.alignment
      });
    }
    this._checkLayout(layout);
    this._layout = layout;
    this._layout.add(this);
  }

  _checkLayout(value) {
    if (!(value instanceof StackLayout)) {
      throw new Error('Not an instance of "StackLayout"');
    }
  }

  _getXMLAttributes() {
    const result = super._getXMLAttributes();
    result.push(['alignment', this.alignment]);
    return result;
  }

}

NativeObject.defineProperties(Stack.prototype, {
  spacing: {
    type: 'number',
    get() {
      return this._layout.spacing;
    }
  },
  alignment: {
    get() {
      return this._layout.alignment;
    }
  }
});
