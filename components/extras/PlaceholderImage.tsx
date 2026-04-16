import classNames from 'classnames';
import PropTypes from 'prop-types';
import { FC, HTMLAttributes } from 'react';

interface IPlaceholderImageProps extends HTMLAttributes<HTMLOrSVGElement> {
	width?: string | number;
	height?: string | number;
	text?: string;
	className?: string;
	ariaLabel?: string;
	alt?: string;
}
const PlaceholderImage: FC<IPlaceholderImageProps> = ({
	width = 75,
	height = 75,
	text = undefined,
	className = undefined,
	ariaLabel = undefined,
}) => {
	return (
		<svg
			className={classNames('placeholder-img', className)}
			width={width}
			height={height}
			xmlns='http://www.w3.org/2000/svg'
			role='img'
			aria-label={ariaLabel || `Imagen de ejemplo: ${width}x${height}`}
			preserveAspectRatio='xMidYMid slice'>
			<rect width='100%' height='100%' fill='#a1b8f7' />
			<text
				x='50%'
				y='50%'
				dominantBaseline='middle'
				textAnchor='middle'
				fill='#f9f9f9'
				fontSize='1.25rem'
				dy='0.1'>
				{text || `${width}x${height}`}
			</text>
		</svg>
	);
};
PlaceholderImage.propTypes = {
	width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	text: PropTypes.string,
	className: PropTypes.string,
	ariaLabel: PropTypes.string,
};

export default PlaceholderImage;
