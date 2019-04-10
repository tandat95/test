//Bitcoin du day
function TP()
{
	$("<div id='divTP'></div>").appendTo($("body"));
	$("#divTP")[0].tpObj = this;

	this.fTradeAmount = 1;
	this.fMinProfit = 10;
	this.fMaxProfit = 50;
	this.nBeginTrade = 1;
	this.nMaxFollowTrade = 4;
	this.strSelTrade = "green";
	this.nPrevTradeCell = 0;
	this.nTradeWin = 0;
	this.nTradeLose = 0;
	this.nTradeFired = 0;
	this.fBalanceValue = 0;
	this.fMaxBalanceValue = 0;
	this.fMinBalanceValue = 0;
	this.bStop = false;
	this.bFirstTrade = false;
	this.nRows = 6;
	this.nCols = 10;
	this.nCount = 60;
	this.strCurTrade = "";
	this.nCurTrade = 0;
	this.arrCurTableRst = null;
	this.arrPrevTableRst = null;
	this.arrTableChainTime = [];
	this.arrTableChainRst = [];
	this.tmrTrade = null;

	this.getTableResult = getTableResult;
	this.getTableChain = getTableChain;
	this.getFullTableChain = getFullTableChain;
	this.getTradeResult = getTradeResult;
	this.getCurrentCell = getCurrentCell;
	this.isBeginTrade = isBeginTrade;
	this.trade = trade;
	this.start = start;
	this.startTrade = startTrade;
	this.getProfit = getProfit;
	this.stop = stop;

	function getTableResult()
	{
		this.arrPrevTableRst = this.arrCurTableRst;
		this.arrCurTableRst = [];

		var nCurCell = this.getCurrentCell();
		var i = 1, nCount = 0;
		for (; i <= nCurCell; i++)
		{
			this.arrCurTableRst[i] = this.getTradeResult(i);
		}
	}

	function getTableChain()
	{
		var arrN = [];
		arrN["green"] = "X";
		arrN["red"] = "D";
		arrN["gold"] = "V";
		var nCurCell = this.getCurrentCell();
		var i = 1, nCount = 0, str = this.arrCurTableRst[1], strRst = [];
		for (; i <= nCurCell; i++)
		{
			if (this.arrCurTableRst[i] == str)
			{
				nCount++;
			}
			else
			{
				if (nCount > 0)
				{
					strRst.push(nCount + arrN[str]);
					str = this.arrCurTableRst[i];
					nCount = 1;
				}
			}
		}
		
		if (nCount > 0)
		{
			strRst.push(nCount + arrN[str]);
		}
		
		if (strRst != null && strRst.length > 0)
		{
			var d = new Date();
			this.arrTableChainTime.push(d.getHours() + ":" + d.getMinutes());
			this.arrTableChainRst.push(strRst.join(" "));
			console.log("Report: ");
			console.log(this.arrTableChainTime[this.arrTableChainTime.length - 1] + " => " + this.arrTableChainRst[this.arrTableChainRst.length - 1]);
		}
	}
	
	function getFullTableChain()
	{
		this.getTableChain();
		console.log("Report full: ");
		var i = 0;
		for (; i < this.arrTableChainTime.length; i++)
		{
			console.log(this.arrTableChainTime[i] + " => " + this.arrTableChainRst[i]);
		}
	}

	function getTradeResult(nCell)
	{
		var nRow = 0, nCol = 0;
		if (nCell > 0)
		{
			nRow = nCell % this.nRows - 1;
			nCol = Math.floor(nCell / this.nRows);
			if (nCell % this.nRows == 0)
			{
				nRow += 6;
				nCol -= 1;
			}
			
			if ($(".result-table:eq(0) tr:eq(" + nRow + ") img:eq(" + nCol + ")")[0].src.indexOf("result-green.png") != -1)
			{
				return "green";
			}
			else if ($(".result-table:eq(0) tr:eq(" + nRow + ") img:eq(" + nCol + ")")[0].src.indexOf("result-red.png") != -1)
			{
				return "red";
			}
			else if ($(".result-table:eq(0) tr:eq(" + nRow + ") img:eq(" + nCol + ")")[0].src.indexOf("result-gold.png") != -1)
			{
				return "gold";
			}
			else
			{
				return "null";
			}
		}
	}
	
	function isBeginTrade(nCurCell)
	{
		var strCurRst = this.arrCurTableRst[nCurCell];
		if (this.strSelTrade != "both" && strCurRst != this.strSelTrade)
			return false;

		var i = 1, nCount = 0, arrRst = [];
		if (this.arrPrevTableRst != null && this.arrPrevTableRst.length > 0)
		{
			for (i = 1; i <= this.nCount; i++)
				arrRst[i] = this.arrPrevTableRst[i];
			nCount = this.nCount;
		}
		for (i = 1; i <= this.nCount; i++)
			arrRst[i + nCount] = this.arrCurTableRst[i];

		i = nCurCell + nCount;
		while (i > 0 && arrRst[i] == strCurRst 
			&& arrRst[i] != "gold" && arrRst[i] != "null")
		{
			i--;
		}

		if (nCurCell + nCount - i == this.nBeginTrade)//du nBeginTrade
			return true;

		return false;
	}

	function getCurrentCell()
	{
		var nCurCell = this.nCount - $(".result-table:eq(0) .result-icon img[src*='result-null.png']").length;
		return nCurCell;
	}

	function trade(strTrade, fAmount)
	{
		$("#bet-amount").val(fAmount);
		this.strCurTrade = strTrade;
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

			this.startTrade();
		}
		else
		{
			console.log("Please enter full parameters.");
		}
	}

	function startTrade()
	{
		if ($("#time-to-bet-text-1").text().indexOf("ORDER") == -1)
		{
			var nWaiting = parseInt($("#time-to-bet-number-1").text()) + 10;
			this.tmrTrade = setTimeout(function(){ $("#divTP")[0].tpObj.startTrade(); }, nWaiting * 1000);
			return;
		}

		var nCurBalanceValue = parseFloat($("#balance-value").text());
		if (!this.bStop && nCurBalanceValue < this.fMaxBalanceValue && nCurBalanceValue > this.fMinBalanceValue)
		{
			var nCurCell = this.getCurrentCell();

			if (nCurCell == 1 || this.arrCurTableRst == null)
			{
				this.getTableResult();
			}
			
			if (nCurCell == this.nCount)
				this.getTableChain();
			
			console.log("------------------------------");
			console.log("Process cell " + nCurCell + "...");
			this.getProfit();
		
			var strCurRst = this.getTradeResult(nCurCell);
			this.arrCurTableRst[nCurCell] = strCurRst;
			console.log("strCurRst = '" + strCurRst + "'");
			console.log("strCurTrade = '" + this.strCurTrade + "'");
			console.log("nCurTrade = " + this.nCurTrade);
			
			if (this.nPrevTradeCell == 0 || this.nPrevTradeCell != nCurCell)
			{
				this.nPrevTradeCell = nCurCell;
			}
			else
			{
				console.log("*************************************************************************************");
				console.log("******************* Network error! Please refresh and try again! *******************");
				console.log("*************************************************************************************");
				this.stop();
				return;
			}
			
			if (this.strCurTrade == "")//trade
			{
				if (this.isBeginTrade(nCurCell) && strCurRst != "gold" && strCurRst != "null"
				&& ((this.strSelTrade == "both") || (this.strSelTrade != "both" && strCurRst ==  this.strSelTrade)))
				{
					this.bFirstTrade = true;
					this.trade(strCurRst, this.fTradeAmount * Math.pow(2, this.nCurTrade));
				}
				else
				{
					console.log("Waiting...");
				}
			}
			else//result
			{
				if (this.strCurTrade == strCurRst)//win
				{
					this.bFirstTrade = false;
					this.nCurTrade = 0;
					this.nTradeWin++;
					console.log("Win " + this.nTradeWin + " (Lose " + this.nTradeLose + " - Fired " + this.nTradeFired + ")");
					console.log("Follow " + strCurRst + " chain...")
					this.trade(strCurRst, this.fTradeAmount);
				}
				else//lose
				{
					console.log("bFirstTrade = " + this.bFirstTrade);
					this.strCurTrade = "";
					if (this.bFirstTrade)
					{
						this.bFirstTrade = false;
						if (this.nCurTrade < this.nMaxFollowTrade - 1)
						{
							this.nCurTrade++;
						}
						else
						{
							this.nCurTrade = 0;
							this.nTradeFired++;
							console.log("Fired " + this.nTradeFired);
						}
					}
					this.nTradeLose++;
					console.log("Lose " + this.nTradeLose + " (Fired " + this.nTradeFired + " - Win " + this.nTradeWin + ")");
				}
			}

			this.tmrTrade = setTimeout(function(){ $("#divTP")[0].tpObj.startTrade(); }, 60000);
		}
		else
		{
			this.stop();
		}
	}

	function getProfit()
	{
		console.log("------------------------------");
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
	}

	function stop()
	{
		console.log("Stop trade");
		this.getProfit();
		this.getFullTableChain();
		
		this.nPrevTradeCell = 0;
		this.strCurTrade = "";
		this.nCurTrade = 0;
		this.bStop = true;
		this.bFirstTrade = false;
		this.arrCurTableRst = null;
		this.arrPrevTableRst = null;
		clearTimeout(this.tmrTrade);
	}
};
var s = new TP();
console.clear();
s.start({ fTradeAmount: 1, fMinProfit: 15, fMaxProfit: 50, nBeginTrade: 4, nMaxFollowTrade: 4, strSelTrade: "both", nCurTrade: 0 });