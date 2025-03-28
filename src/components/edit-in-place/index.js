import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';

const EditInPlace = forwardRef(
  ({ value, defaultValue, setValue, placeholder, disabled = false }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState('');
    const [inputWidth, setInputWidth] = useState(0);
    const editableRef = useRef();
    const contentRef = useRef();

    useImperativeHandle(
      ref,
      () => ({
        focus: editableRef.current?.focus?.(),
      }),
      []
    );

    useEffect(() => setText(value || defaultValue), [value, defaultValue]);

    const editHandler = useCallback(() => {
      setInputWidth(contentRef.current?.offsetWidth || 0);
      setIsEditing(true);
      if (text === defaultValue) {
        setText('');
      }
    }, [text, defaultValue]);

    const blurHandler = useCallback(() => {
      const trimmedText = (text || '').replace(/[\s\u00A0]+/g, ' ').trim();
      setValue?.(trimmedText || defaultValue);
      setIsEditing(false);
    }, [text, setValue, defaultValue]);

    return isEditing && !disabled ? (
      <input
        ref={editableRef}
        autoFocus
        className="eip-input u-unstyledInput"
        placeholder={placeholder ? placeholder : undefined}
        onBlur={blurHandler}
        onChange={({ target: { value: v = '' } = {} } = {}) => setText(v)}
        onKeyDown={(e) =>
          e?.key === 'Enter' && !e?.isComposing ? blurHandler() : null
        }
        value={text || ''}
        style={{ width: inputWidth }}
      />
    ) : (
      <div
        ref={contentRef}
        className="eip-content"
        data-placeholder={placeholder && value === '' ? placeholder : undefined}
        onClick={editHandler}
      >
        {value || ''}
      </div>
    );
  }
);

EditInPlace.propTypes = {
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  setValue: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
};

EditInPlace.displayName = 'EditInPlace';

export default EditInPlace;
