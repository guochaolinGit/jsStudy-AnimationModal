/**
 * 
 * @param {Object} ele 移动的元素
 * @param {Object} targetJson 目标json
 * @param {Object} time  运动时间
 * @param {Object} callback  回调函数
 */
function animate(ele, targetJson, time,callback) {
	//动画间隔要根据不同浏览器来设置：这是动画间隔
	if(window.navigator.userAgent.indexOf("MSIE") != -1) {
		var interval = 50;
	} else {
		var interval = 10;
	}
	//				根据运动时间和动画间隔算出总运动次数
	var maxTimes = time / interval;
	//				初始信号量
	var semaphoreJson = {};
	//步长json
	var stepJson = {};
	//				根据目标获取当前的样式json
	for(var styleKey in targetJson) {
		semaphoreJson[styleKey] = parseFloat(fetchComputedStyle(ele, styleKey));
	}
	//根据信号量、目标量、总运动次数算出步长
	for(var pro in targetJson) {
		//数据返回带有px
		targetJson[pro] = parseFloat(targetJson[pro]);
		stepJson[pro] = (targetJson[pro] - semaphoreJson[pro]) / maxTimes;
	}
	//用来计数,判断是否达到次数
	var count = 0;
	var timmer = setInterval(function() {
		//让所有的属性都运动
		for(var property in targetJson) {
			semaphoreJson[property] += stepJson[property];
			if(property === 'opacity') { //没有单位
				ele.style[property] = semaphoreJson[property];
				ele.style.filter = "alpha(opacity=" + (semaphoreJson[property] * 100) + ")";
			} else {
				ele.style[property] = semaphoreJson[property] + "px";
			}
		}
		count++;
		if(count === maxTimes) { //如果等于了，需要停表
			//可能由于计算不精确，会有小误差，直接将样式走到target上

			for(var k in targetJson) {
				var target = targetJson[k];
				if(k === 'opacity') { //没有单位
					ele.style[k] = target;
					ele.style.filter = "alpha(opacity=" + (target * 100) + ")";
				} else {
					ele.style[k] = target + "px";
				}
			}
			clearInterval(timmer);
			callback.apply(ele);
		}
	}, interval);
}

/**
 * 获取当前元素的计算后样式
 * @param {Object} ele 样式
 * @param {Object} property 具体样式的key
 */
//之前的轮子，计算后样式
function fetchComputedStyle(obj, property) {
	//能力检测
	if(window.getComputedStyle) {
		//现在要把用户输入的property中检测一下是不是驼峰，转为连字符写法
		//强制把用户输入的词儿里面的大写字母，变为小写字母加-
		//paddingLeft  →  padding-left
		property = property.replace(/([A-Z])/g, function(match, $1) {
			return "-" + $1.toLowerCase();
		});
		return window.getComputedStyle(obj)[property];
	} else {
		//IE只认识驼峰，我们要防止用户输入短横，要把短横改为大写字母
		//padding-left  → paddingLeft 
		property = property.replace(/\-([a-z])/g, function(match, $1) {
			return $1.toUpperCase();
		});

		return obj.currentStyle[property];
	}
}