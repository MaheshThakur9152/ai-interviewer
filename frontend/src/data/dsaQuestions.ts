
export const dsaQuestions = [
    {
        id: 1,
        title: "Two Sum",
        difficulty: "Easy",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        solution: `def twoSum(nums, target):
    mp = {}
    for i, n in enumerate(nums):
        if target - n in mp:
            return [mp[target-n], i]
        mp[n] = i`,
        videoUrl: "https://youtu.be/UXDSeD9mN-k",
        example: {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
        },
        constraints: [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9"
        ]
    },
    {
        id: 2,
        title: "Kadane’s Algorithm",
        difficulty: "Medium",
        description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
        solution: `def maxSubArray(nums):
    cur = best = nums[0]
    for n in nums[1:]:
        cur = max(n, cur+n)
        best = max(best, cur)
    return best`,
        videoUrl: "https://youtu.be/w_KEocd__20",
        example: {
            input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
            output: "6",
            explanation: "The subarray [4,-1,2,1] has the largest sum 6."
        },
        constraints: [
            "1 <= nums.length <= 10^5",
            "-10^4 <= nums[i] <= 10^4"
        ]
    },
    {
        id: 3,
        title: "Majority Element",
        difficulty: "Easy",
        description: "Given an array nums of size n, return the majority element. The majority element is the element that appears more than ⌊n / 2⌋ times.",
        solution: `def majorityElement(nums):
    count = candidate = 0
    for n in nums:
        if count == 0: candidate = n
        count += 1 if n == candidate else -1
    return candidate`,
        videoUrl: "https://youtu.be/nP_ns3uSh80",
        example: {
            input: "nums = [3,2,3]",
            output: "3",
            explanation: ""
        },
        constraints: [
            "n == nums.length",
            "1 <= n <= 5 * 10^4",
            "-10^9 <= nums[i] <= 10^9"
        ]
    },
    {
        id: 4,
        title: "Sort Colors",
        difficulty: "Medium",
        description: "Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue.",
        solution: `def sortColors(nums):
    low, mid, high = 0, 0, len(nums)-1
    while mid <= high:
        if nums[mid]==0:
            nums[low],nums[mid]=nums[mid],nums[low]
            low+=1;mid+=1
        elif nums[mid]==1:
            mid+=1
        else:
            nums[mid],nums[high]=nums[high],nums[mid]
            high-=1`,
        videoUrl: "https://youtu.be/oaVa-9wmpns",
        example: {
            input: "nums = [2,0,2,1,1,0]",
            output: "[0,0,1,1,2,2]",
            explanation: ""
        },
        constraints: [
            "n == nums.length",
            "1 <= n <= 300",
            "nums[i] is 0, 1, or 2"
        ]
    },
    {
        id: 5,
        title: "Merge Intervals",
        difficulty: "Medium",
        description: "Merge overlapping intervals.",
        solution: `def merge(intervals):
    intervals.sort()
    res = [intervals[0]]
    for i in intervals[1:]:
        if i[0] <= res[-1][1]:
            res[-1][1] = max(res[-1][1], i[1])
        else:
            res.append(i)
    return res`,
        videoUrl: "https://youtu.be/44H3cEC2fFM"
    },
    {
        id: 6,
        title: "Longest Substring Without Repeating",
        difficulty: "Medium",
        description: "Find length of longest substring without repeating characters.",
        solution: `def lengthOfLongestSubstring(s):
    seen=set()
    l=ans=0
    for r in range(len(s)):
        while s[r] in seen:
            seen.remove(s[l]);l+=1
        seen.add(s[r])
        ans=max(ans,r-l+1)
    return ans`,
        videoUrl: "https://youtu.be/qtVh-XEpsJo"
    },
    {
        id: 7,
        title: "Valid Palindrome",
        difficulty: "Easy",
        description: "Ignore non-alphanumeric characters.",
        solution: `def isPalindrome(s):
    s = ''.join(ch.lower() for ch in s if ch.isalnum())
    return s == s[::-1]`,
        videoUrl: "https://youtu.be/jJXJ16kPFWg"
    },
    {
        id: 8,
        title: "Longest Palindromic Substring",
        difficulty: "Medium",
        description: "Find the longest palindromic substring in s.",
        solution: `def longestPalindrome(s):
    res=""
    for i in range(len(s)):
        l=r=i
        while l>=0 and r<len(s) and s[l]==s[r]:
            if r-l+1>len(res): res=s[l:r+1]
            l-=1;r+=1
        l,r=i,i+1
        while l>=0 and r<len(s) and s[l]==s[r]:
            if r-l+1>len(res): res=s[l:r+1]
            l-=1;r+=1
    return res`,
        videoUrl: "https://youtu.be/XYQecbcd6_c"
    },
    {
        id: 9,
        title: "Binary Search",
        difficulty: "Easy",
        description: "Search target in sorted array.",
        solution: `def binarySearch(arr, target):
    l,r=0,len(arr)-1
    while l<=r:
        m=(l+r)//2
        if arr[m]==target:return m
        if arr[m]<target:l=m+1
        else:r=m-1
    return -1`,
        videoUrl: "https://youtu.be/s4DPM8ct1pI"
    },
    {
        id: 10,
        title: "Search in Rotated Sorted Array",
        difficulty: "Medium",
        description: "Search in rotated sorted array O(log n).",
        solution: `def search(nums,target):
    l,r=0,len(nums)-1
    while l<=r:
        m=(l+r)//2
        if nums[m]==target:return m
        if nums[l]<=nums[m]:
            if nums[l]<=target<nums[m]: r=m-1
            else: l=m+1
        else:
            if nums[m]<target<=nums[r]: l=m+1
            else: r=m-1
    return -1`,
        videoUrl: "https://youtu.be/r3pMQ8-Ad5s"
    },
    {
        id: 11,
        title: "Reverse Linked List",
        difficulty: "Easy",
        description: "Reverse a singly linked list.",
        solution: `def reverseList(head):
    prev=None
    while head:
        nxt=head.next
        head.next=prev
        prev=head
        head=nxt
    return prev`,
        videoUrl: "https://youtu.be/iRtLEoL-r-g"
    },
    {
        id: 12,
        title: "Detect Cycle",
        difficulty: "Easy",
        description: "Detect cycle in linked list using Floyd's algorithm.",
        solution: `def hasCycle(head):
    slow=fast=head
    while fast and fast.next:
        slow=slow.next
        fast=fast.next.next
        if slow==fast: return True
    return False`,
        videoUrl: "https://youtu.be/wiOo4DC5GGA"
    },
    {
        id: 13,
        title: "Merge Two Sorted Lists",
        difficulty: "Easy",
        description: "Merge two sorted linked lists.",
        solution: `def mergeTwoLists(l1,l2):
    dummy=cur=ListNode()
    while l1 and l2:
        if l1.val<l2.val:
            cur.next=l1;l1=l1.next
        else:
            cur.next=l2;l2=l2.next
        cur=cur.next
    cur.next=l1 or l2
    return dummy.next`,
        videoUrl: "https://youtu.be/XIdigk956u0"
    },
    {
        id: 14,
        title: "Valid Parentheses",
        difficulty: "Easy",
        description: "Check if parentheses are valid.",
        solution: `def isValid(s):
    stack=[]
    mp={')':'(',']':'[','}':'{'}
    for c in s:
        if c in mp:
            if not stack or stack.pop()!=mp[c]:
                return False
        else: stack.append(c)
    return not stack`,
        videoUrl: "https://youtu.be/WTzjTskDFMg"
    },
    {
        id: 15,
        title: "Next Greater Element",
        difficulty: "Medium",
        description: "Find next greater element for each element.",
        solution: `def nextGreater(nums):
    res=[-1]*len(nums)
    stack=[]
    for i in range(len(nums)):
        while stack and nums[i]>nums[stack[-1]]:
            res[stack.pop()]=nums[i]
        stack.append(i)
    return res`,
        videoUrl: "https://youtu.be/RkG94TvnUFs"
    },
    {
        id: 16,
        title: "Inorder Traversal",
        difficulty: "Easy",
        description: "Return inorder traversal of binary tree.",
        solution: `def inorder(root):
    return inorder(root.left)+[root.val]+inorder(root.right) if root else []`,
        videoUrl: "https://youtu.be/COZK7NATh4k"
    },
    {
        id: 17,
        title: "Lowest Common Ancestor",
        difficulty: "Medium",
        description: "LCA of binary tree.",
        solution: `def lowestCommonAncestor(root,p,q):
    if not root or root==p or root==q: return root
    l=lowestCommonAncestor(root.left,p,q)
    r=lowestCommonAncestor(root.right,p,q)
    if l and r: return root
    return l or r`,
        videoUrl: "https://youtu.be/_-QHfMDde90"
    },
    {
        id: 18,
        title: "Height of Binary Tree",
        difficulty: "Easy",
        description: "Maximum depth of binary tree.",
        solution: `def height(root):
    if not root: return 0
    return 1 + max(height(root.left), height(root.right))`,
        videoUrl: "https://youtu.be/eD3tmO66aBA"
    },
    {
        id: 19,
        title: "BFS Traversal",
        difficulty: "Medium",
        description: "Breadth-first search of a graph.",
        solution: `from collections import deque
def bfs(graph,start):
    q=deque([start])
    vis=set([start])
    res=[]
    while q:
        node=q.popleft()
        res.append(node)
        for nei in graph[node]:
            if nei not in vis:
                vis.add(nei)
                q.append(nei)
    return res`,
        videoUrl: "https://youtu.be/uDWljP2PGmU"
    },
    {
        id: 20,
        title: "Fibonacci (DP)",
        difficulty: "Easy",
        description: "N-th Fibonacci number using DP.",
        solution: `def fib(n):
    if n<=1:return n
    dp=[0]*(n+1)
    dp[1]=1
    for i in range(2,n+1):
        dp[i]=dp[i-1]+dp[i-2]
    return dp[n]`,
        videoUrl: "https://youtu.be/nqowUJzG-iM"
    }
];
