//Son Thuy Huu Tinh - 2 xanh 1 do danh 1 do
function TP()
{
	function TPCandle(opts)
	{
		if (opts != null 
			&& opts.strCandleColor != null && opts.fCandleHeight != null && opts.fCandleTop != null && opts.fCandleBottom != null 
			&& opts.fBeardHeight != null && opts.fBeardTop != null && opts.fBeardBottom != null)
		{
			this.strCandleColor = opts.strCandleColor;
			this.fCandleHeight = opts.fCandleHeight;
			this.fCandleTop = opts.fCandleTop;
			this.fCandleBottom = opts.fCandleBottom;
			
			this.fBeardHeight = opts.fBeardHeight;
			this.fBeardTop = opts.fBeardTop;
			this.fBeardBottom = opts.fBeardBottom;
		}
	}
	
	function TPCandleChain(opts)
	{
		if (opts != null && opts.strChainColor != null && opts.nChainLength != null)
		{
			this.strChainColor = opts.strChainColor;
			this.nChainLength = opts.nChainLength;
		}
	}
	
	$("<div id='divTP'></div>").appendTo($("body"));
	$("#divTP")[0].tpObj = this;

	this.fTradeAmount = 1;
	this.fMinProfit = 150;
	this.fMaxProfit = 200;
	this.nBeginTrade = 2;
	this.nMaxFollowTrade = 3;
	this.strSelTrade = "red";
	this.nTradeWin = 0;
	this.nTradeLose = 0;
	this.nTradeFired = 0;
	this.fBalanceValue = 0;
	this.fMaxBalanceValue = 0;
	this.fMinBalanceValue = 0;
	this.bStop = false;
	this.nCurTrade = 0;
	this.tmrTrade = null;
	this.arrPrevCandle = null;
	this.arrCandle = null;//luu het tat ca nen, tinh luon nen order (dang nhay)
	this.arrCandleChain = null;//ko tinh nen order
	this.arrCandlePeak = null;//ko tinh nen order, chi luu chi so (trong arrCandle) nhung dinh mau xanh cao nhat
	this.fTrendHeight = 0;
	this.strCurStatus = "waitScanning";
	this.nCurCurrencyType = 1;
	this.nCurCurrencyPair = 1;
	this.arrTradeAmount = [1, 2, 4, 8, 17, 35, 73, 160];
	
	this.getCandleColor = getCandleColor;
	this.compareCandle = compareCandle;
	this.compareAllCandles = compareAllCandles;
	this.getAllCandles = getAllCandles;
	this.checkSignal = checkSignal;
	this.checkTrade = checkTrade;
	this.trade = trade;
	this.start = start;
	this.startTrade = startTrade;
	this.waitForScanning = waitForScanning;
	this.getProfit = getProfit;
	this.showNetworkError = showNetworkError;
	this.stop = stop;
	
	function getCandleColor(str)
	{
		if (str == "#ff0000")
			return "red";
		else if (str == "#008000")
			return "green";
		else
			return "gold";
	}
	
	function compareCandle(c1, c2)
	{
		if (c1.strCandleColor != c2.strCandleColor || c1.fCandleHeight != c2.fCandleHeight 
			|| c1.fCandleTop != c2.fCandleTop || c1.fCandleBottom != c2.fCandleBottom 
			|| c1.fBeardHeight != c2.fBeardHeight || c1.fBeardTop != c2.fBeardTop || c1.fBeardBottom != c2.fBeardBottom)
			return false;
		
		return true;
	}
	
	function compareAllCandles()
	{//giong hoan toan tra ve true
		this.getAllCandles();
		if (this.arrPrevCandle == null || this.arrPrevCandle.length == 0)
			return false;
		
		if (this.arrCandle.length != this.arrPrevCandle.length)
			return false;
		
		var i = 0;
		for (; i < this.arrCandle.length; i++)
		{
			if (!this.compareCandle(this.arrCandle[i], this.arrPrevCandle[i]))
			{
				return false;
			}
		}
		
		return true;
	}
	
	function getAllCandles()
	{
		var strRst = [];
		this.arrPrevCandle = this.arrCandle;
		this.arrCandle = [];
		var nLen = $("svg:eq(0) g[clip-path*='url'] g g").length;
		var i = nLen - 1, objC = null, objB = null, c = null, hC = 0, tC = 0, hB = 0, tB = 0;
		for (; i >= 0; i--)
		{
			objC = $("svg:eq(0) g[clip-path*='url'] g g:eq(" + i + ") rect[fill!='#3366cc']");
			objB = $("svg:eq(0) g[clip-path*='url'] g g:eq(" + i + ") rect[fill='#3366cc']");
			if (objC.length > 0 && objB.length > 0)
			{
				hC = parseFloat(objC.attr("height"));
				tC = parseFloat(objC.attr("y"));
				
				hB = parseFloat(objB.attr("height"));
				tB = parseFloat(objB.attr("y"));
				
				c = new TPCandle(
					{ 	strCandleColor: this.getCandleColor(objC.attr("fill")), 
						fCandleHeight: hC, 
						fCandleTop: tC, 
						fCandleBottom: hC + tC, 
						fBeardHeight: hB, 
						fBeardTop: tB, 
						fBeardBottom: hB + tB });
			}
			else
			{
				c = new TPCandle(
					{ 	strCandleColor: "gold", 
						fCandleHeight: 0, 
						fCandleTop: 0, 
						fCandleBottom: 0, 
						fBeardHeight: 0, 
						fBeardTop: 0, 
						fBeardBottom: 0 });
			}
			this.arrCandle.push(c);
			strRst.push(c.strCandleColor);
		}
		console.log("arrCandle = [" + strRst.join(" ") + "]");
		
		strRst = [];
		this.arrCandleChain = [];
		this.arrCandlePeak = [];
		var i = 1, nCount = 0, str = this.arrCandle[1].strCandleColor;
		if (str != this.strSelTrade && str != "gold")
			this.arrCandlePeak.push(1);
		for (; i < this.arrCandle.length; i++)
		{
			if (this.arrCandle[i].strCandleColor == str)
			{
				nCount++;
			}
			else
			{
				if (nCount > 0)
				{
					c = new TPCandleChain(
						{ 	strChainColor: str, 
							nChainLength: nCount });
					this.arrCandleChain.push(c);
					strRst.push(c.nChainLength + c.strChainColor);
					
					str = this.arrCandle[i].strCandleColor;
					nCount = 1;
					
					if (str != this.strSelTrade && str != "gold")
						this.arrCandlePeak.push(i);
				}
			}
		}
		if (nCount > 0)
		{
			c = new TPCandleChain(
				{ 	strChainColor: str, 
					nChainLength: nCount });
			this.arrCandleChain.push(c);
			strRst.push(c.nChainLength + c.strChainColor);
		}
		console.log("arrCandleChain = [" + strRst.join(" ") + "]");
		console.log("arrCandlePeak = [" + this.arrCandlePeak.join(" ") + "]");
	}
	
	function checkSignal()
	{
		if (this.compareAllCandles())
		{
			console.log("Network may have problems");
			return false;
		}
		
		if (this.arrCandle.length < 5)
		{
			console.log("Too little candles");
			return false;
		}
		
		var i = 1;
		/*for (; i < this.arrCandle.length; i++)
		{
			if (this.arrCandle[i].fCandleHeight < 10)
			{
				console.log("Candle is too low");
				return false;
			}
		}*/
		
		//dk1:it nhat 2 xanh tro len
		if (this.arrCandleChain[0].strChainColor == this.strSelTrade || this.arrCandleChain[0].strChainColor == "gold" 
			|| this.arrCandleChain[0].nChainLength < 2)
		{
			console.log("Condition 1: Not enough " + this.arrCandleChain[0].strChainColor);
			return false;
		}
		
		//dk2:tung co 2 do truoc do
		if (this.arrCandleChain[1].strChainColor != this.strSelTrade || this.arrCandleChain[1].nChainLength < 2)
		{
			console.log("Condition 2: Not enough prev " + this.arrCandleChain[1].strChainColor);
			return false;
		}
			
		//dk3:xu the thuan tang hay giam ko dao chieu
		if (this.arrCandlePeak.length < 2)
		{
			console.log("Too little candle peaks");
			return false;
		}
		var p1 = this.arrCandlePeak[0];
		var p2 = this.arrCandlePeak[1];
		var n1 = this.arrCandle[p1].fCandleTop - this.arrCandle[p2].fCandleTop;
		var n2 = 1;
		for (i = 1; i < this.arrCandlePeak.length - 1; i++)
		{
			p1 = this.arrCandlePeak[i];
			p2 = this.arrCandlePeak[i + 1];
			n2 = this.arrCandle[p1].fCandleTop - this.arrCandle[p2].fCandleTop;
			if (n1 * n2 < 0)
			{
				console.log("Condition 3: The trend has been reversed");
				return false;
			}
		}
		
		//dk4
		if (this.arrCandle[0].strCandleColor != this.strSelTrade && this.arrCandle[0].strCandleColor != "gold" 
			&& this.arrCandle[0].fCandleHeight > 100)
		{
			console.log("fCandleHeight = " + this.arrCandle[0].fCandleHeight);
			console.log("Condition 4: Order candle invalid");
			return false;
		}
		
		//tinh chieu cao xu the
		/*n1 = 0;
		p1 = this.arrCandlePeak[0];//p1 chinh la 1, do bo qua nen order
		for (i = 0; i < this.arrCandleChain[0].nChainLength; i++)
		{
			n1 += this.arrCandle[i + p1].fCandleHeight;
		}
		*/
		
		n1 = 0;
		for (i = 0; i < this.arrCandleChain[0].nChainLength; i++)
		{
			n1 += this.arrCandle[i + 1].fCandleHeight;
		}
		this.fTrendHeight = n1 * 2 / 3;
		console.log("2/3 trend height =" + this.fTrendHeight);
		
		return true;
	}
	
	function checkTrade()
	{
		var nLen = $("svg:eq(0) g[clip-path*='url'] g g").length - 1;
		var objC = $("svg:eq(0) g[clip-path*='url'] g g:eq(" + nLen + ") rect[fill!='#3366cc']");
		if (objC.length == 0)
		{
			console.log("Network may have problems");
			return false;
		}
		
		//nen order la nen do
		if (this.getCandleColor(objC.attr("fill")) != this.strSelTrade)
		{
			console.log("Full Condition: Order candle color invalid");
			return false;
		}
		
		var objB = $("svg:eq(0) g[clip-path*='url'] g g:eq(" + nLen + ") rect[fill='#3366cc']")
		if (objB.length == 0)
		{
			console.log("Network may have problems");
			return false;
		}
		
		//chieu cao rau nen do ko vuot qua 2/3 chieu cao xu the
		var hB = parseFloat(objB.attr("height"));
		console.log("Order candle height = " + hB);
		console.log("2/3 trend height = " + this.fTrendHeight);
		if (hB > this.fTrendHeight)
		{
			console.log("Full Condition: Order candle height invalid");
			return false;
		}
		
		return true;
	}

	function trade(strTrade, fAmount)
	{
		$("#bet-amount").val(fAmount);
		if (strTrade == "red")
		{
			$("#btn-sell1").click();
		}
		else
		{
			$("#btn-buy1").click();
		}
		console.log("Trade " + (this.nCurTrade + 1) + ": '" + strTrade + "' " + (fAmount.toFixed(2)) + "$");
	}

	function start(opts)
	{
		if (opts != null && opts.fTradeAmount != null && opts.fMinProfit != null && opts.fMaxProfit != null 
			&& opts.nBeginTrade != null && opts.nMaxFollowTrade != null && opts.strSelTrade != null)
		{
			console.log("Start trade");

			this.fTradeAmount = opts.fTradeAmount;
			this.fMinProfit = opts.fMinProfit;
			this.fMaxProfit = opts.fMaxProfit;
			this.nBeginTrade = opts.nBeginTrade;
			this.nMaxFollowTrade = opts.nMaxFollowTrade;
			this.strSelTrade = opts.strSelTrade;

			this.fBalanceValue = parseFloat($("#balance-value").text());
			this.fMaxBalanceValue = this.fBalanceValue + this.fMaxProfit + this.fTradeAmount;
			this.fMinBalanceValue = this.fBalanceValue - this.fMinProfit - this.fTradeAmount;
			console.log("fBalanceValue = " + this.fBalanceValue.toFixed(2));
			console.log("fMaxBalanceValue = " + this.fMaxBalanceValue.toFixed(2));
			console.log("fMinBalanceValue = " + this.fMinBalanceValue.toFixed(2));
			
			if (opts.nCurTrade != null)
				this.nCurTrade = opts.nCurTrade;
			
			this.nCurCurrencyType = parseInt($("#broker1").val());
			this.nCurCurrencyPair = parseInt($("#symbol1").val());

			this.startTrade();
		}
		else
		{
			console.log("Please enter full parameters.");
		}
	}

	function startTrade()
	{
		if (this.bStop)
			return;

		console.log("---------------------------");
		console.log("Processing " + $("#symbol1 option:selected").text());
		console.log($("#time-to-bet-text-1").text() + $("#time-to-bet-number-1").text() + "s");
		console.log("nCurCurrencyType = " + $("#broker1 option:eq(" + (this.nCurCurrencyType - 1) + ")").text());
		console.log("nCurCurrencyPair = " + $("#symbol1 option:eq(" + (this.nCurCurrencyPair - 1) + ")").text());
		console.log("nCurTrade = " + this.nCurTrade);
		this.getProfit();
		console.log("strCurStatus = '" + this.strCurStatus + "'");
		
		var nWaiting = 0;
		if ($("#time-to-bet-text-1").text().indexOf("WAITING") != -1)//dang waiting
		{
			nWaiting = parseInt($("#time-to-bet-number-1").text()) + 3;
			console.log("Waiting order time " + nWaiting);
			this.tmrTrade = setTimeout(function(){ $("#divTP")[0].tpObj.startTrade(); }, nWaiting * 1000);
			return;
		}
		
		if (this.strCurStatus == "waitScanning")
		{
			if (this.checkSignal())
			{//co tin hieu
				nWaiting = parseInt($("#time-to-bet-number-1").text());
				if (nWaiting > 4)
				{
					nWaiting -= 3;
					this.strCurStatus = "waitTrading";
					this.tmrTrade = setTimeout(function(){ $("#divTP")[0].tpObj.startTrade(); }, nWaiting * 1000);
					console.log("Found signal, waiting " + nWaiting + "s");
				}
				else
				{
					console.log("nWaiting = " + nWaiting);
					if (nWaiting > 2)
					{
						this.strCurStatus = "waitTrading";
						this.startTrade();
						console.log("Found signal");
					}
					else
					{
						console.log("Found signal, not keep up");
						nWaiting += 35;
						this.tmrTrade = setTimeout(function(){ $("#divTP")[0].tpObj.startTrade(); }, nWaiting * 1000);
					}
				}
			}
			else
			{//ko co tin hieu => tim cap tien khac
				console.log("Not found signal, finding other currency pair");
				this.nCurCurrencyPair++;
				if (this.nCurCurrencyPair > 8)
				{
					this.nCurCurrencyPair = 1;
					this.nCurCurrencyType++;
					if (this.nCurCurrencyType > 2)
						this.nCurCurrencyType = 1;
					$("#broker1").val(this.nCurCurrencyType);
					$('#broker1').trigger("change");
					setTimeout(function(){
							var tpObj = $("#divTP")[0].tpObj;
							$("#symbol1").val(tpObj.nCurCurrencyPair);
							$('#symbol1').trigger("change");
							tpObj.waitForScanning();
						}, 3 * 1000);
				}
				else
				{
					$("#symbol1").val(this.nCurCurrencyPair);
					$('#symbol1').trigger("change");
					this.waitForScanning();
				}
			}
		}
		else if (this.strCurStatus == "waitTrading")
		{
			nWaiting = parseInt($("#time-to-bet-number-1").text());
			if (this.checkTrade())
			{//thoa dk cuoi
				if ($("#time-to-bet-text-1").text().indexOf("ORDER") != -1 && nWaiting > 0)
				{
					this.trade(this.strSelTrade, this.fTradeAmount *  this.arrTradeAmount[this.nCurTrade]);
					this.strCurStatus = "waitResult";
				}
				else
				{
					this.strCurStatus = "waitScanning";
					console.log("Found full signal, not keep up");
				}
			}
			else
			{//ko thoa dk
				this.strCurStatus = "waitScanning";
				console.log("Not found full signal, waiting");
			}
			console.log("nWaiting = " + nWaiting);
			nWaiting += 35;
			this.tmrTrade = setTimeout(function(){ $("#divTP")[0].tpObj.startTrade(); }, nWaiting * 1000);
		}
		else if (this.strCurStatus == "waitResult")
		{
			this.strCurStatus = "waitScanning";
			
			if (this.compareAllCandles())
			{
				this.showNetworkError();
				return;
			}
			
			var nLen = $("svg:eq(0) g[clip-path*='url'] g g").length - 2;
			var objC = $("svg:eq(0) g[clip-path*='url'] g g:eq(" + nLen + ") rect[fill!='#3366cc']");
			if (objC.length == 0)
			{
				this.showNetworkError();
				return;
			}
			
			var strColor = this.getCandleColor(objC.attr("fill"));
			console.log("strColor = " + strColor);
			if (strColor == this.strSelTrade)
			{//win
				this.nCurTrade = 0;
				this.nTradeWin++;
				console.log("Win " + this.nTradeWin + " (Lose " + this.nTradeLose + " - Fired " + this.nTradeFired + ")");
			}
			else
			{//lose
				if (this.nCurTrade < this.nMaxFollowTrade)
				{
					this.nCurTrade++;
				}
				else
				{
					this.nCurTrade = 0;
					this.nTradeFired++;
					console.log("Fired " + this.nTradeFired);
				}
				this.nTradeLose++;
				console.log("Lose " + this.nTradeLose + " (Fired " + this.nTradeFired + " - Win " + this.nTradeWin + ")");
			}
			
			var nCurBalanceValue = parseFloat($("#balance-value").text());
			if (nCurBalanceValue > this.fMaxBalanceValue || nCurBalanceValue < this.fMinBalanceValue)
			{//dat chi tieu
				console.log("Hit target");
				this.stop();
			}
			else
			{
				this.startTrade();
			}
		}
	}
	
	function waitForScanning()
	{
		this.tmrTrade = setTimeout(function(){ $("#divTP")[0].tpObj.startTrade(); }, 3 * 1000);
	}

	function getProfit()
	{
		console.log("-----");
		var nCurBalanceValue = parseFloat($("#balance-value").text());
		var nCurProfit = nCurBalanceValue - this.fBalanceValue;
		console.log("fBalanceValue = " + this.fBalanceValue.toFixed(2));
		console.log(".fMaxBalanceValue = " + this.fMaxBalanceValue.toFixed(2));
		console.log(".fMinBalanceValue = " + this.fMinBalanceValue.toFixed(2));
		console.log("nCurBalanceValue = " + nCurBalanceValue.toFixed(2));
		
		if (nCurProfit > 0)
			console.log("+++ Win " + (nCurProfit.toFixed(2)) + "$ +++");
		else if (nCurProfit < 0)
			console.log("--- Lose " + ((nCurProfit * -1).toFixed(2)) + "$ ---");
		else
			console.log("... Tie ...");
		console.log("Win " + this.nTradeWin + " - Lose " + this.nTradeLose + " - Fired " + this.nTradeFired);
		console.log("-----");
	}
	
	function showNetworkError()
	{
		console.log("*************************************************************************************");
		console.log("******************* Network error! Please refresh and try again! *******************");
		console.log("*************************************************************************************");
		this.stop();
	}

	function stop()
	{
		console.log("Stop trade");
		this.getProfit();		
		
		this.strCurStatus = "waitScanning";
		this.bStop = true;
		clearTimeout(this.tmrTrade);
	}
};
var s = new TP();
console.clear();
s.start({ fTradeAmount: 5, fMinProfit: 150, fMaxProfit: 200, nBeginTrade: 2, nMaxFollowTrade: 3, strSelTrade: "red", nCurTrade: 0 });