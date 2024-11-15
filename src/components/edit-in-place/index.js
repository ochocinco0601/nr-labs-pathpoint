import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';

const PLACEHOLDER_TEXT = 'Untitled';

const EditInPlace = forwardRef(
  ({ value, setValue, placeholder, disabled = false }, ref) => {
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

    useEffect(() => setText(value), [value]);

    const editHandler = useCallback(() => {
      setInputWidth(contentRef.current?.offsetWidth || 0);
      setIsEditing(true);
    }, []);

    const blurHandler = useCallback(() => {
      setValue?.((text || '').replace(/[\s\u00A0]+/g, ' ').trim());
      setIsEditing(false);
    }, [text, setValue]);

    return isEditing && !disabled ? (
      <input
        ref={editableRef}
        autoFocus
        className="eip-input u-unstyledInput"
        placeholder={placeholder || PLACEHOLDER_TEXT}
        onBlur={blurHandler}
        onChange={({ target: { value: v = '' } = {} } = {}) => setText(v)}
        onKeyDown={(e) =>
          e?.key === 'Enter' && !e?.isComposing ? blurHandler() : null
        }
        value={text}
        style={{ width: inputWidth }}
      />
    ) : (
      <div
        ref={contentRef}
        className="eip-content"
        data-placeholder={text ? '' : placeholder || PLACEHOLDER_TEXT}
        onClick={editHandler}
      >
        {value}
      </div>
    );
  }
);

EditInPlace.propTypes = {
  value: PropTypes.string,
  setValue: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
};

EditInPlace.displayName = 'EditInPlace';

export default EditInPlace;
